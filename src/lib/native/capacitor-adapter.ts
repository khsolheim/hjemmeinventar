/**
 * Capacitor Native Adapter
 * Provides native functionality when running as iOS/Android app
 */

import { Capacitor } from '@capacitor/core'

// Platform detection
export const isNative = Capacitor.isNativePlatform()
export const isIOS = Capacitor.getPlatform() === 'ios'
export const isAndroid = Capacitor.getPlatform() === 'android'
export const isWeb = Capacitor.getPlatform() === 'web'

console.log('📱 Capacitor Platform:', {
  platform: Capacitor.getPlatform(),
  isNative,
  isIOS,
  isAndroid,
  isWeb
})

// Camera functionality
export class NativeCamera {
  static async isAvailable(): Promise<boolean> {
    if (!isNative) return false
    
    try {
      const { Camera } = await import('@capacitor/camera')
      return true
    } catch {
      return false
    }
  }

  static async takePicture(): Promise<string | null> {
    if (!isNative) return null
    
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      })
      
      return image.webPath || null
    } catch (error) {
      console.error('Native camera error:', error)
      return null
    }
  }

  static async scanQR(): Promise<string | null> {
    if (!isNative) return null
    
    try {
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner')
      
      // Check permission
      const status = await BarcodeScanner.checkPermission({ force: true })
      if (!status.granted) {
        throw new Error('Camera permission denied')
      }

      // Start scanning
      const result = await BarcodeScanner.startScan()
      
      if (result.hasContent) {
        return result.content
      }
      
      return null
    } catch (error) {
      console.error('Native QR scan error:', error)
      return null
    }
  }

  static async stopQRScan(): Promise<void> {
    if (!isNative) return
    
    try {
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner')
      await BarcodeScanner.stopScan()
    } catch (error) {
      console.error('Stop QR scan error:', error)
    }
  }
}

// Push Notifications
export class NativePush {
  static async isAvailable(): Promise<boolean> {
    if (!isNative) return false
    
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')
      return true
    } catch {
      return false
    }
  }

  static async requestPermissions(): Promise<boolean> {
    if (!isNative) return false
    
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')
      
      const result = await PushNotifications.requestPermissions()
      return result.receive === 'granted'
    } catch (error) {
      console.error('Push permission error:', error)
      return false
    }
  }

  static async register(): Promise<string | null> {
    if (!isNative) return null
    
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')
      
      await PushNotifications.register()
      
      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token) => {
          resolve(token.value)
        })
        
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error)
          resolve(null)
        })
      })
    } catch (error) {
      console.error('Push register error:', error)
      return null
    }
  }

  static async sendLocalNotification(title: string, body: string): Promise<void> {
    if (!isNative) return
    
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) }
        }]
      })
    } catch (error) {
      console.error('Local notification error:', error)
    }
  }
}

// Geolocation
export class NativeGeolocation {
  static async isAvailable(): Promise<boolean> {
    if (!isNative) return false
    
    try {
      const { Geolocation } = await import('@capacitor/geolocation')
      return true
    } catch {
      return false
    }
  }

  static async getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
    if (!isNative) return null
    
    try {
      const { Geolocation } = await import('@capacitor/geolocation')
      
      const position = await Geolocation.getCurrentPosition()
      
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    } catch (error) {
      console.error('Geolocation error:', error)
      return null
    }
  }
}

// Haptic Feedback
export class NativeHaptics {
  static async isAvailable(): Promise<boolean> {
    if (!isNative) return false
    
    try {
      const { Haptics } = await import('@capacitor/haptics')
      return true
    } catch {
      return false
    }
  }

  static async impact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!isNative) return
    
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
      
      const impactStyle = style === 'light' ? ImpactStyle.Light :
                         style === 'heavy' ? ImpactStyle.Heavy :
                         ImpactStyle.Medium
      
      await Haptics.impact({ style: impactStyle })
    } catch (error) {
      console.error('Haptic feedback error:', error)
    }
  }

  static async vibrate(duration: number = 100): Promise<void> {
    if (!isNative) return
    
    try {
      const { Haptics } = await import('@capacitor/haptics')
      await Haptics.vibrate({ duration })
    } catch (error) {
      console.error('Vibration error:', error)
    }
  }
}

// File System
export class NativeFileSystem {
  static async isAvailable(): Promise<boolean> {
    if (!isNative) return false
    
    try {
      const { Filesystem } = await import('@capacitor/filesystem')
      return true
    } catch {
      return false
    }
  }

  static async writeFile(filename: string, data: string): Promise<boolean> {
    if (!isNative) return false
    
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      
      await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: Directory.Documents
      })
      
      return true
    } catch (error) {
      console.error('File write error:', error)
      return false
    }
  }

  static async readFile(filename: string): Promise<string | null> {
    if (!isNative) return null
    
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      
      const result = await Filesystem.readFile({
        path: filename,
        directory: Directory.Documents
      })
      
      return result.data as string
    } catch (error) {
      console.error('File read error:', error)
      return null
    }
  }
}

// App State
export class NativeApp {
  static async isAvailable(): Promise<boolean> {
    if (!isNative) return false
    
    try {
      const { App } = await import('@capacitor/app')
      return true
    } catch {
      return false
    }
  }

  static async addBackButtonListener(handler: () => void): Promise<void> {
    if (!isNative) return
    
    try {
      const { App } = await import('@capacitor/app')
      
      App.addListener('backButton', handler)
    } catch (error) {
      console.error('Back button listener error:', error)
    }
  }

  static async getInfo(): Promise<any> {
    if (!isNative) return null
    
    try {
      const { App } = await import('@capacitor/app')
      return await App.getInfo()
    } catch (error) {
      console.error('App info error:', error)
      return null
    }
  }
}

// Unified Native Interface
export const Native = {
  isNative,
  isIOS,
  isAndroid,
  isWeb,
  Camera: NativeCamera,
  Push: NativePush,
  Geolocation: NativeGeolocation,
  Haptics: NativeHaptics,
  FileSystem: NativeFileSystem,
  App: NativeApp
}

export default Native
