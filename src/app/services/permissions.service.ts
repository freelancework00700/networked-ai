import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ToasterService } from './toaster.service';
import { isPlatformBrowser } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';
import { Contacts } from '@capacitor-community/contacts';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | 'limited';

export interface PermissionResult {
  granted: boolean;
  status: PermissionStatus;
  locationServicesDisabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private platformId = inject(PLATFORM_ID);
  private toasterService = inject(ToasterService);

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  async requestCameraPermission(): Promise<PermissionResult> {
    if (!this.isNativePlatform()) {
      return { granted: false, status: 'denied' };
    }

    try {
      const currentStatus = await Camera.checkPermissions();

      if (currentStatus.camera === 'denied') {
        console.log('Camera permission already denied - cannot request again');
        return { granted: false, status: 'denied' };
      }

      if (currentStatus.camera === 'granted') {
        return { granted: true, status: 'granted' };
      }

      const result = await Camera.requestPermissions({ permissions: ['camera'] });
      console.log('Camera requestPermissions result:', result);
      
      return {
        granted: result.camera === 'granted',
        status: result.camera as PermissionStatus
      };
    } catch (error: any) {
      console.error('Camera permission error:', error);
      this.toasterService.showError('Failed to request camera permission');
      return { granted: false, status: 'denied' };
    }
  }

  async checkCameraPermission(): Promise<PermissionResult> {
    if (!this.isNativePlatform()) {
      return { granted: false, status: 'denied' };
    }

    try {
      const result = await Camera.checkPermissions();

      return {
        granted: result.camera === 'granted',
        status: result.camera as PermissionStatus
      };
    } catch (error: any) {
      console.error('Check camera permission error:', error);
      return { granted: false, status: 'denied' };
    }
  }

  async requestLocationPermission(): Promise<PermissionResult> {
    if (!this.isNativePlatform()) {
      // Web platform
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        console.log('position', position);
        return { granted: true, status: 'granted' };
      } catch (error: any) {
        return { granted: false, status: 'denied' };
      }
    }

    try {
      // First check current permission status
      let currentStatus;
      try {
        currentStatus = await Geolocation.checkPermissions();
        console.log('Location current status:', currentStatus);
      } catch (checkError: any) {
        // If checkPermissions fails due to location services being disabled
        const errorMessage = checkError?.message || checkError?.toString() || '';
        const isLocationServicesDisabled = 
          errorMessage.includes('Location services are not enabled') ||
          errorMessage.includes('Location services') ||
          checkError?.code === 'OS-PLUG-GLOC-0003';
        
        if (isLocationServicesDisabled) {
          return { 
            granted: false, 
            status: 'denied',
            locationServicesDisabled: true 
          };
        }
        throw checkError;
      }

      if (currentStatus.location === 'denied') {
        console.log('Location permission already denied - cannot request again');
        return { granted: false, status: 'denied' };
      }

      if (currentStatus.location === 'granted') {
        return { granted: true, status: 'granted' };
      }

      const result = await Geolocation.requestPermissions();
      console.log('Location requestPermissions result:', result);

      return {
        granted: result.location === 'granted',
        status: result.location as PermissionStatus
      };
    } catch (error: any) {
      console.error('Location permission error:', error);
      return { granted: false, status: 'denied' };
    }
  }

  async checkLocationPermission(): Promise<PermissionResult> {
    if (!this.isNativePlatform()) {
      try {
        if (navigator.permissions) {
          const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          console.log('status', status);
          return {
            granted: status.state === 'granted',
            status: status.state as PermissionStatus
          };
        }
        return { granted: false, status: 'denied' };
      } catch {
        return { granted: false, status: 'denied' };
      }
    }

    try {
      const result = await Geolocation.checkPermissions();
      
      return {
        granted: result.location === 'granted',
        status: result.location as PermissionStatus
      };
    } catch (error: any) {
      console.error('Check location permission error:', error);
      
      const errorMessage = error?.message || error?.toString() || '';
      const isLocationServicesDisabled = 
        errorMessage.includes('Location services are not enabled') ||
        errorMessage.includes('Location services') ||
        error?.code === 'OS-PLUG-GLOC-0003';
      
      if (isLocationServicesDisabled) {
        return { 
          granted: false, 
          status: 'denied',
          locationServicesDisabled: true 
        };
      }
      return { granted: false, status: 'denied' };
    }
  }

  /**
   * Gets the current location for both web and native platforms
   * @param options - Optional geolocation options (timeout, enableHighAccuracy, etc.)
   * @returns Promise with latitude and longitude, or null if unavailable
   */
  async getCurrentLocation(): Promise<{ latitude: string; longitude: string } | null> {
    const defaultOptions = { maximumAge: 0, timeout: 10000, enableHighAccuracy: false };

    if (!this.isNativePlatform()) {
      if (!isPlatformBrowser(this.platformId)) return null;

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, defaultOptions);
        });

        return {
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        };
      } catch (error: any) {
        console.error('Error getting location on web:', error);
        return null;
      }
    }

    // Native platform
    try {
      const position = await Geolocation.getCurrentPosition(defaultOptions);

      return {
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString()
      };
    } catch (error: any) {
      console.error('Error getting location on native:', error);
      return null;
    }
  }

  async requestContactsPermission(): Promise<PermissionResult> {
    if (!this.isNativePlatform()) {
      return { granted: false, status: 'denied' };
    }

    try {
      let currentStatus;
      try {
        currentStatus = await Contacts.checkPermissions();
        console.log('Contacts current status:', currentStatus);
      } catch (checkError: any) {
        console.error('Check contacts permission error:', checkError);
        return { granted: false, status: 'denied' };
      }

      if (currentStatus.contacts === 'denied') {
        console.log('Contacts permission already denied - cannot request again');
        return { granted: false, status: 'denied' };
      }

      if (currentStatus.contacts === 'granted') {
        return { granted: true, status: 'granted' };
      }

      const result = await Contacts.requestPermissions();
      console.log('Contacts requestPermissions result:', result);

      return {
        granted: result.contacts === 'granted',
        status: result.contacts as PermissionStatus
      };
    } catch (error: any) {
      console.error('Contacts permission error:', error);
      return { granted: false, status: 'denied' };
    }
  }

  async checkContactsPermission(): Promise<PermissionResult> {
    if (!this.isNativePlatform()) {
      return { granted: false, status: 'denied' };
    }

    try {
      const result = await Contacts.checkPermissions();

      return {
        granted: result.contacts === 'granted',
        status: result.contacts as PermissionStatus
      };
    } catch (error: any) {
      console.error('Check contacts permission error:', error);
      return { granted: false, status: 'denied' };
    }
  }

  statusToAccessLevel(status: PermissionStatus): 'denied' | 'ask' | 'always' {
    switch (status) {
      case 'granted':
        return 'always';
      case 'prompt':
      case 'prompt-with-rationale':
        return 'ask';
      case 'denied':
      case 'limited':
      default:
        return 'denied';
    }
  }

  async requestPermission(permissionId: 'camera' | 'location' | 'contact'): Promise<{
    result: PermissionResult;
    settingsOpened: boolean;
  }> {
    let result: PermissionResult;
    let previousStatus: PermissionStatus | undefined;
    let settingsOpened = false;

    try {
      switch (permissionId) {
        case 'camera':
          previousStatus = (await this.checkCameraPermission()).status;
          console.log('camera previousStatus', previousStatus);
          
          if (previousStatus === 'denied') {
            await NativeSettings.open({
              optionAndroid: AndroidSettings.ApplicationDetails,
              optionIOS: IOSSettings.App
            });
            settingsOpened = true;
            return { result: { granted: false, status: 'denied' }, settingsOpened: true };
          }
          
          result = await this.requestCameraPermission();
          console.log('camera-result', result);
          break;

        case 'location':
          const locationCheck = await this.checkLocationPermission();
          previousStatus = locationCheck.status;
          console.log('location previousStatus', previousStatus);
          
          if (locationCheck.locationServicesDisabled) {
            await NativeSettings.open({
              optionAndroid: AndroidSettings.Location,
              optionIOS: IOSSettings.LocationServices
            });
            settingsOpened = true;
            return { result: { granted: false, status: 'denied', locationServicesDisabled: true }, settingsOpened: true };
          }
          
          if (previousStatus === 'denied') {
            await NativeSettings.open({
              optionAndroid: AndroidSettings.ApplicationDetails,
              optionIOS: IOSSettings.App
            });
            settingsOpened = true;
            return { result: { granted: false, status: 'denied' }, settingsOpened: true };
          }
          
          result = await this.requestLocationPermission();
          console.log('location-result', result);
          
          if (result.locationServicesDisabled) {
            await NativeSettings.open({
              optionAndroid: AndroidSettings.Location,
              optionIOS: IOSSettings.LocationServices
            });
            settingsOpened = true;
            return { result, settingsOpened: true };
          }
          break;

        case 'contact':
          const contactCheck = await this.checkContactsPermission();
          previousStatus = contactCheck.status;
          console.log('contact previousStatus', previousStatus);
          
          if (previousStatus === 'denied') {
            await NativeSettings.open({
              optionAndroid: AndroidSettings.ApplicationDetails,
              optionIOS: IOSSettings.App
            });
            settingsOpened = true;
            return { result: { granted: false, status: 'denied' }, settingsOpened: true };
          }
          
          result = await this.requestContactsPermission();
          console.log('contact-result', result);
          break;

        default:
          return { result: { granted: false, status: 'denied' }, settingsOpened: false };
      }

      return { result, settingsOpened: false };
    } catch (error: any) {
      console.error(`Failed to request ${permissionId} permission:`, error);
      return { result: { granted: false, status: 'denied' }, settingsOpened: false };
    }
  }
}