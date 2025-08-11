'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Smartphone, 
  Tablet,
  Monitor,
  Wifi,
  Download,
  Zap,

  Vibrate,
  Battery,
  Signal,
  Gauge,
  RefreshCw,
  Settings,
  TestTube,
  Eye,
  HardDrive,
  Cloud,
  Layers,
  Target
} from 'lucide-react'
import { MobileOptimizedCard, MobileItemCard, MobileLocationCard } from '@/components/mobile/MobileOptimizedCard'
import { TouchFriendlyButton, TouchIconButton, TouchFloatingButton } from '@/components/ui/touch-friendly-button'
import { OfflineStatusBanner, useOfflineStatus } from '@/components/mobile/OfflineStatusBanner'
import { offlineManager } from '@/lib/offline/offline-manager'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

export default function MobileDemoPage() {
  const [deviceInfo, setDeviceInfo] = useState<any>({})
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({})
  const [touchTestActive, setTouchTestActive] = useState(false)
  const [touchCount, setTouchCount] = useState(0)
  const [vibrationSupported, setVibrationSupported] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isClient, setIsClient] = useState(false)

  const { isOnline, connectionQuality } = useOfflineStatus()

  // Sample data for demo
  const { data: sampleItemsData } = trpc.items.getAll.useQuery({ limit: 5 })
  const sampleItems = sampleItemsData?.items || []
  const { data: sampleLocations = [] } = trpc.locations.getAll.useQuery()

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      detectDeviceCapabilities()
      measurePerformance()
      initializeOfflineManager()
    }
  }, [])

  const detectDeviceCapabilities = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      deviceMemory: (navigator as any).deviceMemory || 'Ukjent',
      hardwareConcurrency: navigator.hardwareConcurrency || 'Ukjent',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      // @ts-ignore
      connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
      // Screen info
      screenWidth: screen.width,
      screenHeight: screen.height,
      pixelRatio: window.devicePixelRatio,
      // Viewport
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      // Support detection
      vibrationSupported: 'vibrate' in navigator,
      notificationSupported: 'Notification' in window,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      indexedDBSupported: 'indexedDB' in window,
      geolocationSupported: 'geolocation' in navigator,
      cameraSupported: 'mediaDevices' in navigator,
      // PWA info
      standalone: (window as any).navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
    }

    setDeviceInfo(info)
    setVibrationSupported(info.vibrationSupported)
  }

  const measurePerformance = () => {
    const timing = performance.timing
    const navigation = performance.navigation
    
    const metrics = {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      navigationType: navigation.type,
      redirectCount: navigation.redirectCount,
      // Memory info (if available)
      // @ts-ignore
      usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
      // @ts-ignore
      totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0
    }

    setPerformanceMetrics(metrics)
  }

  const initializeOfflineManager = async () => {
    const success = await offlineManager.initialize()
    if (success) {
      toast.success('Offline manager initialiseret!')
    } else {
      toast.error('Offline manager feilet å initialisere')
    }
  }

  const testVibration = () => {
    if (vibrationSupported) {
      navigator.vibrate([100, 50, 100, 50, 200])
      toast.success('Vibrasjon testet!')
    } else {
      toast.error('Vibrasjon ikke støttet på denne enheten')
    }
  }

  const testTouchInteraction = () => {
    setTouchTestActive(true)
    setTouchCount(0)
    
    setTimeout(() => {
      setTouchTestActive(false)
      toast.success(`Touch-test fullført! ${touchCount} berøringer registrert.`)
    }, 5000)
  }

  const handleTouchTest = () => {
    if (touchTestActive) {
      setTouchCount(prev => prev + 1)
    }
  }

  const clearOfflineData = async () => {
    const success = await offlineManager.clearAllOfflineData()
    if (success) {
      toast.success('Alle offline data slettet!')
    } else {
      toast.error('Feil ved sletting av offline data')
    }
  }

  const getDeviceType = () => {
    if (typeof window === 'undefined') return { type: 'unknown', icon: Monitor }
    const width = window.innerWidth
    if (width < 768) return { type: 'mobile', icon: Smartphone }
    if (width < 1024) return { type: 'tablet', icon: Tablet }
    return { type: 'desktop', icon: Monitor }
  }

  const device = getDeviceType()

  // Don't render until client is ready
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Laster mobile funksjoner...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <device.icon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Mobile Optimizations</h1>
            <p className="text-muted-foreground">
              Avanserte mobile features og offline support demo
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            {device.type}
          </Badge>
          <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {deviceInfo.standalone && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              PWA Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Offline Status Banner */}
      <OfflineStatusBanner showDetailedStats={true} className="mb-6" />

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="components">Komponenter</TabsTrigger>
          <TabsTrigger value="performance">Ytelse</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Device Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Enhetsinfo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Plattform:</span>
                  <span className="font-medium">{deviceInfo.platform}</span>
                  
                  <span className="text-muted-foreground">Skjerm:</span>
                  <span className="font-medium">{deviceInfo.screenWidth}×{deviceInfo.screenHeight}</span>
                  
                  <span className="text-muted-foreground">Viewport:</span>
                  <span className="font-medium">{deviceInfo.viewportWidth}×{deviceInfo.viewportHeight}</span>
                  
                  <span className="text-muted-foreground">Pixel Ratio:</span>
                  <span className="font-medium">{deviceInfo.pixelRatio}x</span>
                  
                  <span className="text-muted-foreground">Touch Points:</span>
                  <span className="font-medium">{deviceInfo.maxTouchPoints}</span>
                  
                  <span className="text-muted-foreground">Minne:</span>
                  <span className="font-medium">{deviceInfo.deviceMemory} GB</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Feature Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  {[
                    { name: 'Vibrasjon', supported: deviceInfo.vibrationSupported, icon: Vibrate },
                    { name: 'Notifikasjoner', supported: deviceInfo.notificationSupported, icon: Target },
                    { name: 'Service Worker', supported: deviceInfo.serviceWorkerSupported, icon: Layers },
                    { name: 'IndexedDB', supported: deviceInfo.indexedDBSupported, icon: HardDrive },
                    { name: 'Geolocation', supported: deviceInfo.geolocationSupported, icon: Target },
                    { name: 'Camera', supported: deviceInfo.cameraSupported, icon: Eye }
                  ].map(feature => (
                    <div key={feature.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4" />
                        <span className="text-sm">{feature.name}</span>
                      </div>
                      <Badge variant={feature.supported ? "default" : "outline"}>
                        {feature.supported ? 'Støttet' : 'Ikke støttet'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Connection Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Signal className="w-5 h-5" />
                  Tilkobling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={isOnline ? "default" : "destructive"}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Badge>
                  
                  <span className="text-muted-foreground">Kvalitet:</span>
                  <Badge variant="outline">{connectionQuality}</Badge>
                  
                  {deviceInfo.connection && (
                    <>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{deviceInfo.connection.effectiveType}</span>
                      
                      <span className="text-muted-foreground">Hastighet:</span>
                      <span className="font-medium">{deviceInfo.connection.downlink} Mbps</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          {/* Touch-Friendly Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Touch-Friendly Buttons</CardTitle>
              <CardDescription>
                Optimaliserte knapper med haptic feedback og touch-gestures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TouchFriendlyButton 
                  hapticFeedback={true}
                  onClick={() => toast.success('Standard knapp trykket!')}
                >
                  Standard
                </TouchFriendlyButton>
                
                <TouchFriendlyButton 
                  primary
                  onClick={() => toast.success('Primær knapp trykket!')}
                >
                  Primær
                </TouchFriendlyButton>
                
                <TouchFriendlyButton 
                  success
                  onClick={() => toast.success('Suksess knapp trykket!')}
                >
                  Suksess
                </TouchFriendlyButton>
                
                <TouchFriendlyButton 
                  danger
                  onClick={() => toast.error('Farlig knapp trykket!')}
                >
                  Farlig
                </TouchFriendlyButton>
              </div>

              <div className="flex gap-4">
                <TouchFriendlyButton
                  longPress={true}
                  onLongPress={() => toast.info('Lang-trykk utført!')}
                  hapticFeedback={true}
                >
                  Hold meg nede
                </TouchFriendlyButton>
                
                <TouchFriendlyButton
                  loading={false}
                  onClick={testVibration}
                  disabled={!vibrationSupported}
                  icon={<Vibrate className="w-4 h-4" />}
                >
                  Test Vibrasjon
                </TouchFriendlyButton>
              </div>

              <div className="flex gap-2">
                <TouchIconButton
                  icon={<Settings className="w-5 h-5" />}
                  aria-label="Innstillinger"
                  onClick={() => toast.info('Innstillinger åpnet')}
                />
                <TouchIconButton
                  icon={<RefreshCw className="w-5 h-5" />}
                  aria-label="Oppdater"
                  onClick={() => toast.info('Oppdaterer...')}
                />
                <TouchIconButton
                  icon={<TestTube className="w-5 h-5" />}
                  aria-label="Test"
                  onClick={testTouchInteraction}
                />
              </div>

              {touchTestActive && (
                <Card className="p-4 border-2 border-dashed border-blue-500 bg-blue-50">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Touch Test Aktiv!</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Trykk i dette området så mye du kan på 5 sekunder
                    </p>
                    <div className="w-full h-32 bg-blue-100 rounded-lg flex items-center justify-center cursor-pointer"
                         onClick={handleTouchTest}>
                      <span className="text-2xl font-bold">{touchCount}</span>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Mobile Optimized Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile-Optimized Cards</CardTitle>
              <CardDescription>
                Kort med swipe-gestures og touch-interaksjoner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sampleItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Gjenstander (swipe for handlinger)</h4>
                  {sampleItems.slice(0, 3).map((item) => (
                    <MobileItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => toast.info(`Redigerer ${item.name}`)}
                      onDelete={() => toast.error(`Sletter ${item.name}`)}
                      onView={() => toast.info(`Viser ${item.name}`)}
                      syncStatus="synced"
                      offline={!isOnline}
                    />
                  ))}
                </div>
              )}

              {sampleLocations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Lokasjoner</h4>
                  {sampleLocations.slice(0, 2).map((location) => (
                    <MobileLocationCard
                      key={location.id}
                      location={location}
                      onEdit={() => toast.info(`Redigerer ${location.name}`)}
                      onDelete={() => toast.error(`Sletter ${location.name}`)}
                      onView={() => toast.info(`Viser ${location.name}`)}
                      itemCount={Math.floor(Math.random() * 20)}
                      priority="normal"
                      syncStatus="synced"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Load Performance</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Total Load Time', value: `${performanceMetrics.loadTime}ms` },
                      { label: 'DOM Content Loaded', value: `${performanceMetrics.domContentLoaded}ms` },
                      { label: 'First Paint', value: `${Math.round(performanceMetrics.firstPaint)}ms` },
                      { label: 'First Contentful Paint', value: `${Math.round(performanceMetrics.firstContentfulPaint)}ms` }
                    ].map(metric => (
                      <div key={metric.label} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{metric.label}:</span>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Memory Usage</h4>
                  <div className="space-y-2">
                    {performanceMetrics.usedJSHeapSize > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Used JS Heap:</span>
                          <span className="text-sm font-medium">
                            {Math.round(performanceMetrics.usedJSHeapSize / 1024 / 1024)}MB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total JS Heap:</span>
                          <span className="text-sm font-medium">
                            {Math.round(performanceMetrics.totalJSHeapSize / 1024 / 1024)}MB
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Device Memory:</span>
                      <span className="text-sm font-medium">{deviceInfo.deviceMemory} GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offline Tab */}
        <TabsContent value="offline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Offline Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => offlineManager.syncOfflineActions()}
                  disabled={!isOnline}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Data
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={clearOfflineData}
                >
                  <HardDrive className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>

              <OfflineStatusBanner showDetailedStats={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <TouchFloatingButton
        position="bottom-right"
        onClick={() => toast.success('Floating Action Button trykket!')}
        icon={<Download className="w-6 h-6" />}
        aria-label="Quick action"
      />
    </div>
  )
}
