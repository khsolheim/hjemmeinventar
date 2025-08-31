'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { usePlatform } from '@/lib/platform/platform-detector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import jsQR from 'jsqr'

interface AdaptiveCameraProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
  type: 'qr' | 'barcode'
  className?: string
}

export function AdaptiveCamera({ onScan, onError, type, className }: AdaptiveCameraProps) {
  const { platform, loading } = usePlatform()
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Platform-specific camera constraints
  const getCameraConstraints = useCallback(() => {
    if (!platform) return { video: true }

    const featureConfig = new (require('@/lib/platform/platform-detector')).PlatformDetector().getFeatureConfig(platform)
    const uiConfig = new (require('@/lib/platform/platform-detector')).PlatformDetector().getUIConfig(platform)

    if (platform.isMobile) {
      return {
        video: {
          facingMode: platform.preferRearCamera ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      }
    }

    if (platform.isTablet) {
      return {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }
      }
    }

    // Desktop
    return {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 60 }
      }
    }
  }, [platform])

  const startCamera = useCallback(async () => {
    if (!platform?.hasCamera) {
      toast.error('Kamera ikke tilgjengelig på denne enheten')
      return
    }

    try {
      setIsScanning(true)
      
      // Platform-specific haptic feedback
      if (platform.isMobile && platform.hasVibration) {
        navigator.vibrate(50)
      }

      const constraints = getCameraConstraints()
      console.log(`📹 ${type.toUpperCase()} Scanner: Starting camera with constraints:`, constraints)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        
        // Start scanning
        startScanning()
        
        toast.success(`${type.toUpperCase()}-skanner startet`)
      }
    } catch (error) {
      console.error(`❌ ${type.toUpperCase()} Scanner: Camera failed:`, error)
      setIsScanning(false)
      toast.error('Kunne ikke starte kamera')
      onError?.('Kamera-feil')
    }
  }, [platform, getCameraConstraints, type, onError])

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }

    setIsScanning(false)
    
    if (platform?.isMobile && platform.hasVibration) {
      navigator.vibrate(30)
    }
    
    toast.info('Kamera stoppet')
  }, [stream, platform])

  const startScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const scanInterval = platform?.isMobile ? 300 : 200 // Slower on mobile for battery
    
    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context || video.readyState !== 4) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      if (type === 'qr') {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (qrCode?.data) {
          console.log(`✅ ${type.toUpperCase()} detected:`, qrCode.data)
          
          // Platform-specific feedback
          if (platform?.hasVibration) {
            navigator.vibrate([100, 50, 100])
          }
          
          onScan(qrCode.data)
          stopCamera()
        }
      }
      // Add barcode scanning logic here if needed
    }, scanInterval)
  }, [platform, type, onScan, stopCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  if (loading || !platform) {
    return <div className="animate-pulse p-4">Laster kamera...</div>
  }

  if (!platform.hasCamera) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Kamera ikke tilgjengelig på denne enheten
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {type === 'qr' ? 'QR-kode' : 'Strekkode'} skanning
          {platform.isPWA && <span className="text-xs bg-blue-100 px-2 py-1 rounded">PWA</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isScanning ? (
          <div className="text-center space-y-4">
            <div className={`mx-auto border-4 border-dashed border-muted rounded-lg flex items-center justify-center ${
              platform.isMobile ? 'w-48 h-48' : 'w-64 h-64'
            }`}>
              <Camera className={`text-muted-foreground ${
                platform.isMobile ? 'w-12 h-12' : 'w-16 h-16'
              }`} />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {platform.isMobile 
                  ? `Mobil ${type.toUpperCase()}-skanning med ${platform.preferRearCamera ? 'bakre' : 'fremre'} kamera`
                  : `Desktop ${type.toUpperCase()}-skanning`
                }
              </p>
              
              <Button onClick={startCamera} size={platform.isMobile ? 'lg' : 'default'}>
                <Camera className="w-4 h-4 mr-2" />
                Start {type.toUpperCase()}-skanning
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className={`w-full border rounded-lg ${
                  platform.isMobile ? 'max-w-sm' : 'max-w-md'
                } mx-auto block`}
                autoPlay
                playsInline
                muted
                style={{
                  transform: platform.isMobile && platform.preferRearCamera ? 'scaleX(-1)' : 'none'
                }}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`border-2 border-primary border-dashed rounded-lg ${
                  type === 'qr' ? 'w-48 h-48' : 'w-64 h-32'
                }`}>
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Hold {type === 'qr' ? 'QR-koden' : 'strekkoden'} innenfor rammen
              </p>
              
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={stopCamera}>
                  <X className="w-4 h-4 mr-2" />
                  Stopp
                </Button>
                
                {platform.isMobile && (
                  <Button variant="outline" onClick={() => {
                    stopCamera()
                    setTimeout(startCamera, 100)
                  }}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Bytt kamera
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
