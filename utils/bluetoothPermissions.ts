import { PermissionsAndroid, Platform } from 'react-native';

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      console.log('Requesting Bluetooth permissions...');
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
      
      console.log('Requesting permissions:', permissions);
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      // Log the result of each permission
      Object.entries(granted).forEach(([permission, result]) => {
        console.log(`Permission ${permission}: ${result}`);
      });

      const allGranted = Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
      console.log('All permissions granted:', allGranted);
      
      if (!allGranted) {
        console.log('Some permissions were not granted. Please grant all permissions in Settings.');
        // Try to open app settings to let user grant permissions manually
        try {
          await PermissionsAndroid.requestMultiple(permissions);
        } catch (err) {
          console.log('Error requesting permissions again:', err);
        }
      }
      
      return allGranted;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  }
  // For iOS, you may want to use react-native-permissions or handle separately
  return true;
}

// Add default export to satisfy Expo Router
export default function BluetoothPermissions() {
  return null;
} 