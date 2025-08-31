'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, QrCode, X, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
  className?: string
}

export function QRScanner({ onScan, onError, className = '' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)
  const [deviceInfo, setDeviceInfo] = useState<{
    hasRearCamera: boolean
    isMobile: boolean
    isIOS: boolean
    isIOSChrome: boolean
    isIOSFirefox: boolean
    isIOSEdge: boolean
    isIOSSafari: boolean
  }>({ 
    hasRearCamera: false, 
    isMobile: false, 
    isIOS: false,
    isIOSChrome: false,
    isIOSFirefox: false,
    isIOSEdge: false,
    isIOSSafari: false
  })

  // Detect device capabilities
  useEffect(() => {
    const detectDevice = async () => {
      const userAgent = navigator.userAgent
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isIOS = /iPad|iPhone|iPod/.test(userAgent)
      
      // Detect specific iOS browsers
      const isIOSChrome = isIOS && /CriOS/i.test(userAgent)
      const isIOSFirefox = isIOS && /FxiOS/i.test(userAgent)
      const isIOSEdge = isIOS && /EdgiOS/i.test(userAgent)
      const isIOSSafari = isIOS && !isIOSChrome && !isIOSFirefox && !isIOSEdge
      
      console.log('Browser detection:', {
        isIOS,
        isIOSChrome,
        isIOSFirefox, 
        isIOSEdge,
        isIOSSafari,
        userAgent
      })
      
      let hasRearCamera = false
      
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const videoDevices = devices.filter(device => device.kind === 'videoinput')
          
          // Check if any device has environment facing mode
          for (const device of videoDevices) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: device.deviceId, facingMode: 'environment' }
              })
              stream.getTracks().forEach(track => track.stop())
              hasRearCamera = true
              break
            } catch (e) {
              // Continue checking other devices
            }
          }
        } catch (error) {
          console.warn('Could not enumerate devices:', error)
        }
      }
      
      setDeviceInfo({ 
        hasRearCamera, 
        isMobile, 
        isIOS,
        isIOSChrome,
        isIOSFirefox,
        isIOSEdge,
        isIOSSafari
      })
    }
    
    detectDevice()
  }, [])

  // Simplified camera permission check
  useEffect(() => {
    const checkCameraSupport = async () => {
      console.log('🔍 QR Scanner: Checking camera support...')
      
      // Basic API check
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error('❌ QR Scanner: MediaDevices API not supported')
        setHasPermission(false)
        return
      }
      
      console.log('✅ QR Scanner: MediaDevices API available')
      
      // Don't test camera access here - wait for user to click start
      // This prevents permission prompts on page load
      setHasPermission(null) // null = unknown, will test when user clicks start
    }
    
    checkCameraSupport()
  }, [])

  // Simplified start scanning function
  const startScanning = useCallback(async () => {
    console.log('🚀 QR Scanner: Starting camera...')

    try {
      setIsScanning(true)

      // Simple progressive fallback approach
      let mediaStream: MediaStream
      
      try {
        // Try basic camera first
        console.log('📹 QR Scanner: Trying basic camera access...')
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
        console.log('✅ QR Scanner: Basic camera successful')
      } catch (basicError) {
        console.warn('❌ QR Scanner: Basic camera failed:', basicError)
        
        // Try with rear camera
        try {
          console.log('📹 QR Scanner: Trying rear camera...')
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          })
          console.log('✅ QR Scanner: Rear camera successful')
        } catch (rearError) {
          console.error('❌ QR Scanner: All camera attempts failed:', rearError)
          throw rearError
        }
      }

      // Set permission to true since we got camera access
      setHasPermission(true)

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Try to play video with error handling for AbortError
        try {
          await videoRef.current.play()
        } catch (playError) {
          // Ignore AbortError - this happens when component unmounts or stream changes
          if (playError instanceof DOMException && playError.name === 'AbortError') {
            console.log('Video play aborted - component likely unmounting')
            return
          }
          // Re-throw other errors
          throw playError
        }
        
        // Check if component is still mounted before continuing
        if (!mountedRef.current) {
          return
        }

        // Start scanning for QR codes - optimized for mobile performance
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const scanInterval = isMobile ? 300 : 200 // Slower on mobile to preserve battery
        
        scanIntervalRef.current = setInterval(() => {
          if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
            detectQRCode()
          }
        }, scanInterval)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      if (mountedRef.current) {
        setIsScanning(false)
      }
      toast.error('Kunne ikke få tilgang til kameraet')
      onError?.('Kamera-feil')
    }
  }, [hasPermission, onError])

  // Stop camera and scanning
  const stopScanning = useCallback(() => {
    // Haptic feedback for stopping scan
    if ('vibrate' in navigator) {
      navigator.vibrate(30) // Very short vibration for stop
    }

    if (mountedRef.current) {
      setIsScanning(false)
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      if (mountedRef.current) {
        setStream(null)
      }
    }

    if (videoRef.current) {
      // Pause video first to prevent AbortError
      try {
        videoRef.current.pause()
      } catch (pauseError) {
        // Ignore pause errors - video might already be stopped
        console.log('Video pause error (ignored):', pauseError)
      }
      
      // Clear the source
      videoRef.current.srcObject = null
    }
  }, [stream])

  // Handle scan result
  const handleScanResult = useCallback((result: string) => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]) // Double vibration pattern for success
    }

    onScan(result)
    stopScanning()
    toast.success(`QR-kode skannet: ${result}`)
  }, [onScan, stopScanning])

  // Real QR code detection using jsQR library
  const detectQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context || video.readyState !== 4) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Use jsQR to detect QR codes
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert', // Faster processing
    })
    
    if (qrCode && qrCode.data) {
      console.log('QR Code detected:', qrCode.data)
      handleScanResult(qrCode.data)
    }
  }, [handleScanResult])



  // Handle manual input
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim())
      setManualInput('')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      stopScanning()
    }
  }, [stopScanning])

  return (
    <div className={`qr-scanner ${className}`}>
      <div className="space-y-6">
        {/* Camera Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Kamera-skanning
            </CardTitle>
            <CardDescription>
              {hasPermission === false 
                ? 'Kamera ikke tilgjengelig eller tilgang nektet'
                : deviceInfo.isMobile 
                  ? `${deviceInfo.isIOS 
                      ? `iOS ${deviceInfo.isIOSChrome ? 'Chrome' : deviceInfo.isIOSFirefox ? 'Firefox' : deviceInfo.isIOSEdge ? 'Edge' : 'Safari'}-optimalisert` 
                      : 'Mobil-optimalisert'} skanning${deviceInfo.hasRearCamera ? ' med bakre kamera' : ''}`
                  : 'Bruk kameraet til å skanne QR-koder automatisk'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPermission === false ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Kamera-tilgang ikke tilgjengelig
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>For å aktivere kamera-skanning:</p>
                    <ul className="list-disc list-inside space-y-1 text-left max-w-xs mx-auto">
                      <li>Tillat kamera-tilgang når nettleseren spør</li>
                      <li>Sjekk at siden bruker HTTPS (sikker tilkobling)</li>
                      <li>Kontroller nettleserinnstillinger for kamera</li>
                      <li>Prøv å oppdatere siden</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Bruk manuell inntasting nedenfor i mellomtiden.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Prøv kamera igjen
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                          stream.getTracks().forEach(track => track.stop())
                          toast.success('Kamera fungerer! Prøv å starte skanning.')
                          window.location.reload()
                        } catch (error) {
                          console.error('Kamera-test feilet:', error)
                          toast.error('Kamera-test feilet. Sjekk tillatelser.')
                        }
                      }}
                    >
                      Test kamera
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!isScanning ? (
                  <div className="text-center py-8">
                    <div className="w-32 h-32 mx-auto border-4 border-dashed border-muted rounded-lg flex items-center justify-center mb-4">
                      <Camera className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Trykk på knappen nedenfor for å starte kameraet
                    </p>
                    <Button onClick={startScanning}>
                      <Camera className="w-4 h-4 mr-2" />
                      Start kamera-skanning
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto border rounded-lg touch-manipulation"
                        autoPlay
                        playsInline
                        muted
                        webkit-playsinline="true"
                        x5-playsinline="true"
                        x5-video-player-type="h5"
                        x5-video-player-fullscreen="false"
                        style={{
                          // Optimize for mobile touch and performance
                          WebkitUserSelect: 'none',
                          WebkitTouchCallout: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          objectFit: 'cover',
                          transform: 'scaleX(-1)', // Mirror for selfie-style view
                        }}
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                      
                      {/* Scanning overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                          {/* Corner markers */}
                          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

                          {/* Scanning animation */}
                          <div className="absolute inset-0 border border-primary rounded-lg animate-pulse opacity-50"></div>

                          {/* Center target */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-primary rounded-full opacity-30"></div>
                        </div>

                        {/* Instruction text */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                          <p className="text-sm text-primary font-medium bg-background/80 px-3 py-1 rounded-full">
                            Plasser QR-koden innenfor rammen
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Hold QR-koden innenfor rammen for å skanne
                      </p>
                      <Button variant="outline" onClick={stopScanning}>
                        <X className="w-4 h-4 mr-2" />
                        Stopp skanning
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Manuell inntasting
            </CardTitle>
            <CardDescription>
              Skriv inn QR-koden manuelt hvis skanning ikke fungerer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="manual-qr">QR-kode</Label>
                <Input
                  id="manual-qr"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="F.eks. KJK-0001, SOV-0001, ITEM-001"
                  className="font-mono"
                />
              </div>
              <Button type="submit" disabled={!manualInput.trim()} className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Behandle kode
              </Button>
            </form>
            

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Compact scanner for modals/inline use
export function QRScannerCompact({ 
  onScan, 
  onClose 
}: { 
  onScan: (result: string) => void
  onClose?: () => void 
}) {
  const [manualInput, setManualInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      setManualInput('')
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Skriv inn QR-kode..."
          className="font-mono"
          autoFocus
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={!manualInput.trim()} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Behandle
          </Button>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
      

    </div>
  )
}
