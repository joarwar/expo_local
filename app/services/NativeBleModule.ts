import { NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';

const { BleModule } = NativeModules;

export interface BleModuleInterface {
  connectToDevice(deviceId: string): Promise<boolean>;
  startMonitoring(characteristicUuid: string): Promise<boolean>;
  stopMonitoring(characteristicUuid: string): Promise<boolean>;
  disconnect(): Promise<boolean>;
}

export interface BleEvent {
  characteristic: string;
  value: string;
}

class NativeBleService {
  private module: BleModuleInterface;
  private eventEmitter: NativeEventEmitter;
  private listeners: Map<string, EmitterSubscription>;

  constructor() {
    this.module = BleModule;
    this.eventEmitter = new NativeEventEmitter(BleModule);
    this.listeners = new Map();
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    return await this.module.connectToDevice(deviceId);
  }

  async startMonitoring(characteristicUuid: string): Promise<boolean> {
    return await this.module.startMonitoring(characteristicUuid);
  }

  async stopMonitoring(characteristicUuid: string): Promise<boolean> {
    return await this.module.stopMonitoring(characteristicUuid);
  }

  async disconnect(): Promise<boolean> {
    return await this.module.disconnect();
  }

  addListener(callback: (event: BleEvent) => void): EmitterSubscription {
    const subscription = this.eventEmitter.addListener(
      'onCharacteristicChanged',
      callback
    );
    this.listeners.set(callback.toString(), subscription);
    return subscription;
  }

  removeListener(callback: (event: BleEvent) => void): void {
    const subscription = this.listeners.get(callback.toString());
    if (subscription) {
      subscription.remove();
      this.listeners.delete(callback.toString());
    }
  }
}

export const nativeBleService = new NativeBleService(); 