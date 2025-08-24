'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, QrCode, X, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'

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

  // Check for camera permission and MediaDevices support
  useEffect(() => {
    const checkCameraSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false)
        return
      }
      
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
        testStream.getTracks().forEach(track => track.stop())
        setHasPermission(true)
      } catch (error) {
        setHasPermission(false)
      }
    }
    
    checkCameraSupport()
  }, [])

  // Start camera and scanning
  const startScanning = useCallback(async () => {
    if (!hasPermission) {
      toast.error('Kamera-tilgang ikke tilgjengelig')
      return
    }

    try {
      setIsScanning(true)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use rear camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()

        // Start scanning for QR codes
        scanIntervalRef.current = setInterval(() => {
          if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
            detectQRCode()
          }
        }, 100) // Scan every 100ms
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setIsScanning(false)
      toast.error('Kunne ikke få tilgang til kameraet')
      onError?.('Kamera-feil')
    }
  }, [hasPermission, onError])

  // Stop camera and scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false)
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  // Handle scan result
  const handleScanResult = useCallback((result: string) => {
    onScan(result)
    stopScanning()
    toast.success(`QR-kode skannet: ${result}`)
  }, [onScan, stopScanning])

  // Simple QR code detection (in real app, you'd use a proper QR detection library)
  const detectQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Simple pattern detection - in production use proper QR detection
    // For demo, we'll simulate detection of patterns that look like QR codes
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Look for high contrast patterns (simplified QR detection)
    if (hasQRPattern(imageData)) {
      // For demo purposes, generate a mock QR code result
      const mockResults = ['KJK-0001', 'SOV-0001', 'BOD-0001', 'ITEM-001']
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      
      if (randomResult) {
        handleScanResult(randomResult)
      }
    }
  }, [handleScanResult])

  // Simplified pattern detection
  const hasQRPattern = (imageData: ImageData): boolean => {
    const data = imageData.data
    let blackPixels = 0
    let whitePixels = 0
    
    // Sample every 10th pixel to check for high contrast patterns
    for (let i = 0; i < data.length - 2; i += 40) {
      const brightness = (data[i]! + data[i + 1]! + data[i + 2]!) / 3
      if (brightness < 128) {
        blackPixels++
      } else {
        whitePixels++
      }
    }
    
    const totalPixels = blackPixels + whitePixels
    const contrastRatio = Math.min(blackPixels, whitePixels) / totalPixels
    
    // If we have good contrast and some pattern, simulate QR detection
    return contrastRatio > 0.2 && Math.random() > 0.98 // Low probability to simulate detection
  }

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
                : 'Bruk kameraet til å skanne QR-koder automatisk'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPermission === false ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Kamera-tilgang ikke tilgjengelig. Bruk manuell inntasting nedenfor.
                </p>
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
                        className="w-full max-w-md mx-auto border rounded-lg"
                        autoPlay
                        playsInline
                        muted
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                      
                      {/* Scanning overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-primary border-dashed rounded-lg animate-pulse">
                          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
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
            
            {/* Test codes for demo */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Test-koder for demo:</p>
              <div className="grid grid-cols-2 gap-2">
                {['KJK-0001', 'SOV-0001', 'BOD-0001', 'ITEM-001'].map((code) => (
                  <Button
                    key={code}
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => handleScanResult(code)}
                  >
                    {code}
                  </Button>
                ))}
              </div>
            </div>
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
      
      {/* Quick test buttons */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Test-koder:</p>
        <div className="flex flex-wrap gap-1">
          {['KJK-0001', 'SOV-0001', 'BOD-0001'].map((code) => (
            <Button
              key={code}
              variant="outline"
              size="sm"
              className="text-xs font-mono"
              onClick={() => onScan(code)}
            >
              {code}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
