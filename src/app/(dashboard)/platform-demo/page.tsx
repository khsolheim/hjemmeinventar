'use client'

import { usePlatform, PlatformDetector } from '@/lib/platform/platform-detector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AdaptiveCamera } from '@/components/adaptive/AdaptiveCamera'
import { useState } from 'react'

export default function PlatformDemoPage() {
  const { platform, loading } = usePlatform()
  const [scanResult, setScanResult] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!platform) {
    return <div>Kunne ikke detektere plattform</div>
  }

  const detector = PlatformDetector.getInstance()
  const uiConfig = detector.getUIConfig(platform)
  const featureConfig = detector.getFeatureConfig(platform)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🔍 Plattform-demo</h1>
        <p className="text-muted-foreground">
          Se hvordan HMS tilpasser seg din enhet automatisk
        </p>
      </div>

      {/* Platform Detection Results */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Din enhet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Enhetstype</h4>
              <div className="space-y-1">
                {platform.isDesktop && <Badge variant="default">🖥️ Desktop</Badge>}
                {platform.isMobile && <Badge variant="default">📱 Mobil</Badge>}
                {platform.isTablet && <Badge variant="default">📱 Tablet</Badge>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Operativsystem</h4>
              <div className="space-y-1">
                {platform.isIOS && <Badge variant="secondary">🍎 iOS</Badge>}
                {platform.isAndroid && <Badge variant="secondary">🤖 Android</Badge>}
                {platform.isMacOS && <Badge variant="secondary">🍎 macOS</Badge>}
                {platform.isWindows && <Badge variant="secondary">🪟 Windows</Badge>}
                {platform.isLinux && <Badge variant="secondary">🐧 Linux</Badge>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Nettleser</h4>
              <div className="space-y-1">
                {platform.isChrome && (
                  <Badge variant="outline">
                    🌐 Chrome {platform.isIOS ? '(iOS)' : ''}
                  </Badge>
                )}
                {platform.isSafari && (
                  <Badge variant="outline">
                    🧭 Safari {platform.isIOS ? '(iOS)' : ''}
                  </Badge>
                )}
                {platform.isFirefox && (
                  <Badge variant="outline">
                    🦊 Firefox {platform.isIOS ? '(iOS)' : ''}
                  </Badge>
                )}
                {platform.isEdge && (
                  <Badge variant="outline">
                    🌊 Edge {platform.isIOS ? '(iOS)' : ''}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">PWA Status</h4>
              <div className="space-y-1">
                {platform.isPWA ? (
                  <Badge variant="default">✅ Installert som app</Badge>
                ) : platform.canInstall ? (
                  <Badge variant="secondary">📥 Kan installeres</Badge>
                ) : (
                  <Badge variant="destructive">❌ Ikke støttet</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Skjerminfo</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Størrelse:</span>
                <Badge variant="outline" className="ml-2">{platform.screenSize}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Orientering:</span>
                <Badge variant="outline" className="ml-2">{platform.orientation}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Pixel ratio:</span>
                <Badge variant="outline" className="ml-2">{platform.pixelRatio}x</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Oppløsning:</span>
                <Badge variant="outline" className="ml-2">
                  {window.innerWidth}x{window.innerHeight}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">🔍 Debug-informasjon</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">User Agent:</span>
                <div className="bg-muted p-2 rounded font-mono text-xs break-all mt-1">
                  {navigator.userAgent}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Platform:</span>
                <Badge variant="outline" className="ml-2">{navigator.platform}</Badge>
              </div>
              <div className="text-muted-foreground text-xs">
                💡 Åpne Developer Console (F12) for detaljerte deteksjons-logger
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Funksjoner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CapabilityItem 
              label="Kamera" 
              available={platform.hasCamera}
              icon="📷"
            />
            <CapabilityItem 
              label="Vibrasjon" 
              available={platform.hasVibration}
              icon="📳"
            />
            <CapabilityItem 
              label="Notifikasjoner" 
              available={platform.hasNotifications}
              icon="🔔"
            />
            <CapabilityItem 
              label="Geolokasjon" 
              available={platform.hasGeolocation}
              icon="📍"
            />
            <CapabilityItem 
              label="Deling" 
              available={platform.hasShare}
              icon="📤"
            />
            <CapabilityItem 
              label="QR-skanning" 
              available={featureConfig.qrScanning}
              icon="📱"
            />
            <CapabilityItem 
              label="Offline-modus" 
              available={featureConfig.offlineMode}
              icon="📴"
            />
            <CapabilityItem 
              label="Push-varsler" 
              available={featureConfig.pushNotifications}
              icon="🔔"
            />
          </div>
        </CardContent>
      </Card>

      {/* UI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 UI-tilpasning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Layout</h4>
              <ul className="space-y-2 text-sm">
                <li>• Bunn-navigasjon: {uiConfig.showBottomNav ? '✅' : '❌'}</li>
                <li>• Sidebar: {uiConfig.showSidebar ? '✅' : '❌'}</li>
                <li>• Tab-bar: {uiConfig.showTabBar ? '✅' : '❌'}</li>
                <li>• Container padding: {uiConfig.containerPadding}</li>
                <li>• Font størrelse: {uiConfig.fontSize}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Interaksjoner</h4>
              <ul className="space-y-2 text-sm">
                <li>• Swipe-gester: {uiConfig.useSwipeGestures ? '✅' : '❌'}</li>
                <li>• Hover-effekter: {uiConfig.useHoverEffects ? '✅' : '❌'}</li>
                <li>• Haptic feedback: {uiConfig.useHapticFeedback ? '✅' : '❌'}</li>
                <li>• Animasjon: {uiConfig.animationDuration}ms</li>
                <li>• Kamera: {uiConfig.preferRearCamera ? 'Bakre' : 'Fremre'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Camera Demo */}
      {platform.hasCamera && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">📷 Live kamera-demo</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdaptiveCamera
              type="qr"
              onScan={(result) => {
                setScanResult(result)
                console.log('QR skannet:', result)
              }}
              onError={(error) => console.error('QR feil:', error)}
            />
            
            {scanResult && (
              <Card>
                <CardHeader>
                  <CardTitle>✅ Skannet resultat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono bg-muted p-3 rounded">
                    {scanResult}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setScanResult(null)}
                    className="mt-3"
                  >
                    Nullstill
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Test Platform Features */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test funksjoner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platform.hasVibration && (
              <Button 
                variant="outline"
                onClick={() => navigator.vibrate([100, 50, 100])}
              >
                📳 Test vibrasjon
              </Button>
            )}
            
            {platform.hasNotifications && (
              <Button 
                variant="outline"
                onClick={async () => {
                  if (Notification.permission === 'granted') {
                    new Notification('HMS Test', { body: 'Notifikasjon fungerer!' })
                  } else {
                    await Notification.requestPermission()
                  }
                }}
              >
                🔔 Test notifikasjon
              </Button>
            )}
            
            {platform.hasShare && (
              <Button 
                variant="outline"
                onClick={() => {
                  navigator.share({
                    title: 'HMS Demo',
                    text: 'Sjekk ut denne kule HMS-appen!',
                    url: window.location.href
                  })
                }}
              >
                📤 Test deling
              </Button>
            )}
            
            {platform.hasGeolocation && (
              <Button 
                variant="outline"
                onClick={() => {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => alert(`Posisjon: ${pos.coords.latitude}, ${pos.coords.longitude}`),
                    (err) => alert('Geolokasjon feilet: ' + err.message)
                  )
                }}
              >
                📍 Test lokasjon
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CapabilityItem({ label, available, icon }: { 
  label: string
  available: boolean
  icon: string 
}) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
      <Badge variant={available ? "default" : "secondary"}>
        {available ? "✅" : "❌"}
      </Badge>
    </div>
  )
}
