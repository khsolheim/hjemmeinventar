'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Smartphone, Globe, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Native } from '@/lib/native/capacitor-adapter'
import { AdaptiveCamera } from '@/components/adaptive/AdaptiveCamera'

interface HybridCameraProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
  type: 'qr' | 'barcode' | 'photo'
  className?: string
}

export function HybridCamera({ onScan, onError, type, className }: HybridCameraProps) {
  const [isNativeAvailable, setIsNativeAvailable] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [useNative, setUseNative] = useState(false)

  // Check native availability on mount
  useEffect(() => {
    const checkNative = async () => {
      const available = await Native.Camera.isAvailable()
      setIsNativeAvailable(available)
      setUseNative(available && Native.isNative) // Default to native if available
      
      console.log('📱 Hybrid Camera:', {
        isNative: Native.isNative,
        isIOS: Native.isIOS,
        isAndroid: Native.isAndroid,
        cameraAvailable: available,
        willUseNative: available && Native.isNative
      })
    }
    
    checkNative()
  }, [])

  const handleNativeQRScan = useCallback(async () => {
    if (!isNativeAvailable) {
      toast.error('Native kamera ikke tilgjengelig')
      return
    }

    try {
      setIsScanning(true)
      
      // Haptic feedback
      await Native.Haptics.impact('light')
      
      toast.info('Starter native QR-skanner...')
      
      const result = await Native.Camera.scanQR()
      
      if (result) {
        // Success haptic
        await Native.Haptics.impact('heavy')
        
        // Local notification
        await Native.Push.sendLocalNotification(
          'QR-kode skannet!',
          `Kode: ${result.substring(0, 20)}...`
        )
        
        onScan(result)
        toast.success('QR-kode skannet!')
      } else {
        toast.info('Ingen QR-kode funnet')
      }
    } catch (error) {
      console.error('Native QR scan error:', error)
      toast.error('QR-skanning feilet')
      onError?.('Native QR-skanning feilet')
    } finally {
      setIsScanning(false)
      await Native.Camera.stopQRScan()
    }
  }, [isNativeAvailable, onScan, onError])

  const handleNativePhoto = useCallback(async () => {
    if (!isNativeAvailable) {
      toast.error('Native kamera ikke tilgjengelig')
      return
    }

    try {
      setIsScanning(true)
      
      // Haptic feedback
      await Native.Haptics.impact('medium')
      
      const imagePath = await Native.Camera.takePicture()
      
      if (imagePath) {
        // Success haptic
        await Native.Haptics.impact('heavy')
        
        onScan(imagePath) // Return image path
        toast.success('Bilde tatt!')
      } else {
        toast.info('Ingen bilde tatt')
      }
    } catch (error) {
      console.error('Native photo error:', error)
      toast.error('Kunne ikke ta bilde')
      onError?.('Native foto feilet')
    } finally {
      setIsScanning(false)
    }
  }, [isNativeAvailable, onScan, onError])

  const stopNativeScanning = useCallback(async () => {
    if (type === 'qr') {
      await Native.Camera.stopQRScan()
    }
    setIsScanning(false)
  }, [type])

  // If not native or user prefers web, use adaptive camera
  if (!useNative || !isNativeAvailable) {
    return (
      <div className={className}>
        {isNativeAvailable && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Native {Native.isIOS ? 'iOS' : 'Android'} kamera tilgjengelig
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseNative(true)}
              >
                <Zap className="w-4 h-4 mr-1" />
                Bruk native
              </Button>
            </div>
          </div>
        )}
        
        <AdaptiveCamera
          type={type as 'qr' | 'barcode'}
          onScan={onScan}
          onError={onError}
        />
      </div>
    )
  }

  // Native camera interface
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Native {Native.isIOS ? 'iOS' : 'Android'} Kamera
          <div className="flex gap-1">
            {Native.isIOS && <span className="text-xs bg-gray-100 px-2 py-1 rounded">iOS</span>}
            {Native.isAndroid && <span className="text-xs bg-green-100 px-2 py-1 rounded">Android</span>}
            <span className="text-xs bg-blue-100 px-2 py-1 rounded">Native</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Native Camera Controls */}
          <div className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto border-4 border-dashed border-primary rounded-lg flex items-center justify-center">
              <Camera className="w-16 h-16 text-primary" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {type === 'qr' && 'Native QR-skanning med optimal ytelse'}
                {type === 'barcode' && 'Native strekkode-skanning'}
                {type === 'photo' && 'Native kamera for bilder'}
              </p>
              
              <div className="flex gap-2 justify-center">
                {!isScanning ? (
                  <>
                    {type === 'qr' && (
                      <Button onClick={handleNativeQRScan} size="lg">
                        <Camera className="w-4 h-4 mr-2" />
                        Start QR-skanning
                      </Button>
                    )}
                    
                    {type === 'photo' && (
                      <Button onClick={handleNativePhoto} size="lg">
                        <Camera className="w-4 h-4 mr-2" />
                        Ta bilde
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => setUseNative(false)}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Bruk web-kamera
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">
                        {type === 'qr' && 'Skanner QR-koder...'}
                        {type === 'photo' && 'Åpner kamera...'}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={stopNativeScanning}
                      size="sm"
                    >
                      Avbryt
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Native Features Info */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 text-sm">🚀 Native fordeler:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Raskere oppstart og skanning</li>
              <li>• Bedre batterilevetid</li>
              <li>• Haptic feedback og notifikasjoner</li>
              <li>• Optimalisert for {Native.isIOS ? 'iOS' : 'Android'}</li>
              <li>• Fungerer offline</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
