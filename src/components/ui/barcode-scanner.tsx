/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Scan, 
  X, 
  AlertCircle, 
  Check, 
  Loader2,
  Package,
  ShoppingCart,
  Eye,
  Search
} from 'lucide-react'
import { toast } from 'sonner'

// QuaggaJS declaration
declare const Quagga: any

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string, productInfo?: ProductInfo) => void
  onError?: (error: string) => void
  className?: string
}

export interface ProductInfo {
  name?: string
  brand?: string
  category?: string
  description?: string
  imageUrl?: string
  ingredients?: string
  nutritionFacts?: any
  allergens?: string[]
  packaging?: string
  weight?: string
  price?: number
  source: 'openfoodfacts' | 'manual' | 'unknown'
}

interface ScanResult {
  barcode: string
  timestamp: Date
  productInfo?: ProductInfo
  success: boolean
}

export function BarcodeScanner({ 
  onBarcodeDetected, 
  onError, 
  className = '' 
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [manualBarcode, setManualBarcode] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [recentScans, setRecentScans] = useState<ScanResult[]>([])
  const [lastDetectedBarcode, setLastDetectedBarcode] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check camera permission
  useEffect(() => {
    const checkCameraSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false)
        return
      }
      
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ video: true })
        testStream.getTracks().forEach(track => track.stop())
        setHasPermission(true)
      } catch (error) {
        setHasPermission(false)
      }
    }
    
    checkCameraSupport()
  }, [])

  const lookupProduct = async (barcode: string): Promise<ProductInfo | null> => {
    try {
      // Try Open Food Facts API first (for food products)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await response.json()
      
      if (data.status === 1 && data.product) {
        const product = data.product
        return {
          name: product.product_name || product.product_name_en,
          brand: product.brands,
          category: product.categories,
          description: product.ingredients_text,
          imageUrl: product.image_url,
          ingredients: product.ingredients_text,
          nutritionFacts: product.nutriments,
          allergens: product.allergens_tags,
          packaging: product.packaging,
          weight: product.quantity,
          source: 'openfoodfacts'
        }
      }
      
      // Could add more APIs here for non-food products
      // e.g., UPC Database, Walmart API, etc.
      
      return null
    } catch (error) {
      console.error('Product lookup error:', error)
      return null
    }
  }

  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    // Prevent duplicate detections within 2 seconds
    if (lastDetectedBarcode === barcode) return
    setLastDetectedBarcode(barcode)
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Reset the last detected barcode after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setLastDetectedBarcode(null)
    }, 2000)

    setIsLookingUp(true)
    
    try {
      const productInfo = await lookupProduct(barcode)
      
      const scanResult: ScanResult = {
        barcode,
        timestamp: new Date(),
        productInfo: productInfo || undefined,
        success: !!productInfo
      }
      
      setRecentScans(prev => [scanResult, ...prev.slice(0, 4)]) // Keep last 5 scans
      
      if (productInfo) {
        toast.success(`Produkt funnet: ${productInfo.name || barcode}`)
      } else {
        toast.info(`Strekkode skannet: ${barcode} (Produktinfo ikke funnet)`)
      }
      
      onBarcodeDetected(barcode, productInfo || undefined)
    } catch (error) {
      console.error('Barcode processing error:', error)
      toast.error('Feil ved behandling av strekkode')
      onError?.('Feil ved behandling av strekkode')
    } finally {
      setIsLookingUp(false)
    }
  }, [lastDetectedBarcode, onBarcodeDetected, onError])

  const startScanning = useCallback(async () => {
    if (!hasPermission) {
      toast.error('Kamera-tilgang ikke tilgjengelig')
      return
    }

    if (!scannerContainerRef.current) {
      toast.error('Scanner container ikke klar')
      return
    }

    setIsScanning(true)
    
    try {
      // Initialize QuaggaJS
      await new Promise<void>((resolve, reject) => {
        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerContainerRef.current,
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment" // Use rear camera if available
            }
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader", 
              "code_39_reader",
              "code_39_vin_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
              "i2of5_reader"
            ]
          },
          locate: true,
          locator: {
            halfSample: true,
            patchSize: "medium", // x-small, small, medium, large, x-large
            debug: {
              showCanvas: false,
              showPatches: false,
              showFoundPatches: false,
              showSkeleton: false,
              showLabels: false,
              showPatchLabels: false,
              showRemainingPatchLabels: false,
              boxFromPatches: {
                showTransformed: false,
                showTransformedBox: false,
                showBB: false
              }
            }
          }
        }, (err: any) => {
          if (err) {
            console.error('QuaggaJS init error:', err)
            reject(err)
            return
          }
          resolve()
        })
      })

      // Start scanning
      Quagga.start()
      
      // Set up detection handler
      Quagga.onDetected((result: any) => {
        const barcode = result.codeResult.code
        if (barcode && barcode.length >= 8) { // Valid barcode length
          handleBarcodeDetected(barcode)
        }
      })
      
      toast.success('Scanner startet - hold strekkoden i kameraet')
    } catch (error) {
      console.error('Scanner start error:', error)
      setIsScanning(false)
      toast.error('Kunne ikke starte scanner')
      onError?.('Scanner-feil')
    }
  }, [hasPermission, handleBarcodeDetected, onError])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    setLastDetectedBarcode(null)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    try {
      Quagga.stop()
      Quagga.offDetected()
      toast.info('Scanner stoppet')
    } catch (error) {
      console.error('Error stopping scanner:', error)
    }
  }, [])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      await handleBarcodeDetected(manualBarcode.trim())
      setManualBarcode('')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  return (
    <div className={`barcode-scanner ${className}`}>
      <div className="space-y-6">
        {/* Camera Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Strekkode-skanning
            </CardTitle>
            <CardDescription>
              {hasPermission === false 
                ? 'Kamera ikke tilgjengelig - bruk manuell inntasting nedenfor'
                : 'Skann EAN/UPC strekkoder for automatisk produktidentifikasjon'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPermission === false ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Kamera ikke tilgjengelig. Bruk manuell inntasting nedenfor.
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
                      Trykk på knappen for å starte strekkode-skanning
                    </p>
                    <Button onClick={startScanning}>
                      <Scan className="w-4 h-4 mr-2" />
                      Start skanning
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Scanner Container */}
                    <div className="relative">
                      <div
                        ref={scannerContainerRef}
                        className="w-full max-w-md mx-auto border rounded-lg overflow-hidden bg-black"
                        style={{ minHeight: '300px' }}
                      />
                      
                      {/* Scanning overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-32 border-2 border-primary border-dashed rounded-lg">
                          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      {isLookingUp && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Slår opp produktinformasjon...</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mb-4">
                        Hold strekkoden innenfor rammen for å skanne
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
              <Search className="w-5 h-5" />
              Manuell inntasting
            </CardTitle>
            <CardDescription>
              Skriv inn strekkoden manuelt hvis skanning ikke fungerer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="manual-barcode">Strekkode (EAN/UPC)</Label>
                <Input
                  id="manual-barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="F.eks. 7038010056604"
                  className="font-mono"
                />
              </div>
              <Button type="submit" disabled={!manualBarcode.trim() || isLookingUp} className="w-full">
                {isLookingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Slår opp...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Slå opp produkt
                  </>
                )}
              </Button>
            </form>
            
            {/* Test barcodes */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Test-strekkoder:</p>
              <div className="grid grid-cols-2 gap-2">
                {['7038010001000', '5901234123457', '3017620422003', '8901030837109'].map((barcode) => (
                  <Button
                    key={barcode}
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => handleBarcodeDetected(barcode)}
                  >
                    {barcode}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Nylige skanninger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        {scan.success ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Package className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {scan.productInfo?.name || 'Ukjent produkt'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {scan.productInfo?.brand && `${scan.productInfo.brand} • `}
                          <span className="font-mono">{scan.barcode}</span>
                          {' • '}
                          {scan.timestamp.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scan.success ? (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Funnet
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Search className="w-3 h-3 mr-1" />
                          Ukjent
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBarcodeDetected(scan.barcode)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Compact version for inline use in forms
export function BarcodeScannerCompact({ 
  onBarcodeDetected 
}: { 
  onBarcodeDetected: (barcode: string, productInfo?: ProductInfo) => void 
}) {
  const [manualBarcode, setManualBarcode] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)

  const lookupProduct = async (barcode: string): Promise<ProductInfo | null> => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await response.json()
      
      if (data.status === 1 && data.product) {
        const product = data.product
        return {
          name: product.product_name || product.product_name_en,
          brand: product.brands,
          category: product.categories,
          source: 'openfoodfacts'
        }
      }
      
      return null
    } catch (error) {
      console.error('Product lookup error:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualBarcode.trim()) return

    setIsLookingUp(true)
    try {
      const productInfo = await lookupProduct(manualBarcode.trim())
      onBarcodeDetected(manualBarcode.trim(), productInfo || undefined)
      setManualBarcode('')
      
      if (productInfo) {
        toast.success(`Produkt funnet: ${productInfo.name}`)
      } else {
        toast.info('Strekkode registrert (produktinfo ikke funnet)')
      }
    } catch (error) {
      toast.error('Feil ved oppslag av produkt')
    } finally {
      setIsLookingUp(false)
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          placeholder="Strekkode..."
          className="font-mono"
          disabled={isLookingUp}
        />
        <Button 
          type="submit" 
          disabled={!manualBarcode.trim() || isLookingUp}
        >
          {isLookingUp ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Scan className="w-4 h-4" />
          )}
        </Button>
      </form>
      
      <div className="text-xs text-muted-foreground">
        Skann eller skriv inn EAN/UPC strekkode for automatisk produktinfo
      </div>
    </div>
  )
}
