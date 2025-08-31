/**
 * Platform Detection and Adaptation System
 * Detects device type and provides platform-specific configurations
 */

export interface PlatformInfo {
  // Device type
  isDesktop: boolean
  isMobile: boolean
  isTablet: boolean
  
  // Operating systems
  isIOS: boolean
  isAndroid: boolean
  isMacOS: boolean
  isWindows: boolean
  isLinux: boolean
  
  // Browsers
  isChrome: boolean
  isSafari: boolean
  isFirefox: boolean
  isEdge: boolean
  
  // PWA context
  isPWA: boolean
  isStandalone: boolean
  canInstall: boolean
  
  // Capabilities
  hasCamera: boolean
  hasVibration: boolean
  hasNotifications: boolean
  hasGeolocation: boolean
  hasShare: boolean
  
  // Screen info
  screenSize: 'small' | 'medium' | 'large' | 'xlarge'
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
}

export class PlatformDetector {
  private static instance: PlatformDetector
  private platformInfo: PlatformInfo | null = null

  static getInstance(): PlatformDetector {
    if (!PlatformDetector.instance) {
      PlatformDetector.instance = new PlatformDetector()
    }
    return PlatformDetector.instance
  }

  async detectPlatform(): Promise<PlatformInfo> {
    if (this.platformInfo) {
      return this.platformInfo
    }

    const userAgent = navigator.userAgent
    const platform = navigator.platform
    
    // Device type detection
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?=.*Tablet)|Tablet/i.test(userAgent) || 
                    (isMobile && window.innerWidth > 768)
    const isDesktop = !isMobile && !isTablet

    // OS detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/i.test(userAgent)
    const isMacOS = /Mac|MacIntel|MacPPC|Mac68K/i.test(platform)
    const isWindows = /Win32|Win64|Windows|WinCE/i.test(platform)
    const isLinux = /Linux/i.test(platform) && !isAndroid

    // Enhanced browser detection with iOS-specific handling
    const isIOSChrome = isIOS && /CriOS/i.test(userAgent)
    const isIOSFirefox = isIOS && /FxiOS/i.test(userAgent)
    const isIOSEdge = isIOS && /EdgiOS/i.test(userAgent)
    const isIOSSafari = isIOS && !isIOSChrome && !isIOSFirefox && !isIOSEdge && /Safari/i.test(userAgent)
    
    // General browser detection (including iOS variants)
    const isChrome = isIOSChrome || (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent) && !isIOS)
    const isSafari = isIOSSafari || (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent) && !/CriOS/i.test(userAgent) && !isIOS) || (isIOS && !isIOSChrome && !isIOSFirefox && !isIOSEdge)
    const isFirefox = isIOSFirefox || (/Firefox/i.test(userAgent) && !isIOS)
    const isEdge = isIOSEdge || (/Edg/i.test(userAgent) && !isIOS)

    console.log('🔍 Browser detection details:', {
      userAgent,
      isIOS,
      isIOSChrome,
      isIOSFirefox,
      isIOSEdge,
      isIOSSafari,
      finalResults: { isChrome, isSafari, isFirefox, isEdge }
    })

    // PWA detection
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                 (window.navigator as any).standalone === true
    const isStandalone = isPWA
    
    // Check if app can be installed
    let canInstall = false
    if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
      canInstall = true
    }

    // Capability detection
    const hasCamera = !!(navigator.mediaDevices?.getUserMedia)
    const hasVibration = 'vibrate' in navigator
    const hasNotifications = 'Notification' in window
    const hasGeolocation = 'geolocation' in navigator
    const hasShare = 'share' in navigator

    // Screen info
    const width = window.innerWidth
    let screenSize: 'small' | 'medium' | 'large' | 'xlarge'
    if (width < 640) screenSize = 'small'
    else if (width < 1024) screenSize = 'medium' 
    else if (width < 1440) screenSize = 'large'
    else screenSize = 'xlarge'

    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    const pixelRatio = window.devicePixelRatio || 1

    this.platformInfo = {
      isDesktop,
      isMobile,
      isTablet,
      isIOS,
      isAndroid,
      isMacOS,
      isWindows,
      isLinux,
      isChrome,
      isSafari,
      isFirefox,
      isEdge,
      isPWA,
      isStandalone,
      canInstall,
      hasCamera,
      hasVibration,
      hasNotifications,
      hasGeolocation,
      hasShare,
      screenSize,
      orientation,
      pixelRatio
    }

    console.log('🔍 Platform detected:', this.platformInfo)
    return this.platformInfo
  }

  // Get platform-specific configurations
  getUIConfig(platform: PlatformInfo) {
    return {
      // Navigation
      showBottomNav: platform.isMobile,
      showSidebar: platform.isDesktop,
      showTabBar: platform.isTablet,
      
      // Layout
      containerPadding: platform.isMobile ? '1rem' : '2rem',
      cardSpacing: platform.isMobile ? '0.5rem' : '1rem',
      fontSize: platform.isMobile ? 'sm' : 'base',
      
      // Interactions
      useSwipeGestures: platform.isMobile || platform.isTablet,
      useHoverEffects: platform.isDesktop,
      useHapticFeedback: platform.isMobile && platform.hasVibration,
      
      // Camera
      preferRearCamera: platform.isMobile,
      cameraResolution: platform.isMobile ? 'medium' : 'high',
      
      // Performance
      animationDuration: platform.isMobile ? 200 : 300,
      lazyLoadThreshold: platform.isMobile ? 100 : 200,
    }
  }

  // Get platform-specific features
  getFeatureConfig(platform: PlatformInfo) {
    return {
      // Core features
      qrScanning: platform.hasCamera,
      barcodeScanning: platform.hasCamera,
      offlineMode: true,
      
      // Platform-specific features
      pushNotifications: platform.hasNotifications && platform.isPWA,
      backgroundSync: platform.isPWA,
      shareAPI: platform.hasShare,
      installPrompt: platform.canInstall && !platform.isPWA,
      
      // Advanced features
      geolocation: platform.hasGeolocation,
      fileSystemAccess: platform.isDesktop && platform.isChrome,
      webUSB: platform.isDesktop && platform.isChrome,
    }
  }
}

// React hook for platform detection
import { useState, useEffect } from 'react'

export function usePlatform() {
  const [platform, setPlatform] = useState<PlatformInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detector = PlatformDetector.getInstance()
    detector.detectPlatform().then(info => {
      setPlatform(info)
      setLoading(false)
    })
  }, [])

  return { platform, loading }
}
