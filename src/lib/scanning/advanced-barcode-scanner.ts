import Quagga from 'quagga'

export interface ScanResult {
  code: string
  format: string
  confidence: number
  timestamp: Date
  rawData?: any
}

export interface ScannerConfig {
  targetElementId: string
  width: number
  height: number
  formats: BarcodeFormat[]
  locator?: {
    patchSize: 'medium' | 'large' | 'x-large'
    halfSample: boolean
  }
  numOfWorkers: number
  frequency: number
  debug?: boolean
}

export type BarcodeFormat = 
  | 'code_128' 
  | 'code_39' 
  | 'ean_13' 
  | 'ean_8' 
  | 'codabar' 
  | 'i2of5' 
  | 'upc_a' 
  | 'upc_e' 
  | 'code_93'
  | 'code_39_vin'

export interface ProductData {
  barcode: string
  name?: string
  brand?: string
  category?: string
  description?: string
  imageUrl?: string
  nutrition?: any
  ingredients?: string[]
  allergens?: string[]
  source: 'openfoodfacts' | 'upc' | 'manual'
}

class AdvancedBarcodeScanner {
  private isInitialized = false
  private isScanning = false
  private scanResultCallback?: (result: ScanResult) => void
  private scanHistory: ScanResult[] = []
  private confidenceThreshold = 80

  private defaultConfig: Partial<ScannerConfig> = {
    width: 640,
    height: 480,
    formats: ['code_128', 'ean_13', 'ean_8', 'code_39', 'upc_a', 'upc_e'],
    locator: {
      patchSize: 'medium',
      halfSample: true
    },
    numOfWorkers: 2,
    frequency: 10,
    debug: false
  }

  async initialize(config: Partial<ScannerConfig>): Promise<boolean> {
    try {
      const fullConfig = { ...this.defaultConfig, ...config }
      
      if (!fullConfig.targetElementId) {
        throw new Error('Target element ID is required')
      }

      const quaggaConfig = {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: `#${fullConfig.targetElementId}`,
          constraints: {
            width: fullConfig.width,
            height: fullConfig.height,
            facingMode: 'environment' // Use back camera
          }
        },
        locator: fullConfig.locator,
        numOfWorkers: fullConfig.numOfWorkers,
        frequency: fullConfig.frequency,
        decoder: {
          readers: fullConfig.formats!.map(format => {
            switch (format) {
              case 'code_128': return 'code_128_reader'
              case 'code_39': return 'code_39_reader'
              case 'ean_13': return 'ean_13_reader'
              case 'ean_8': return 'ean_8_reader'
              case 'codabar': return 'codabar_reader'
              case 'i2of5': return 'i2of5_reader'
              case 'upc_a': return 'upc_a_reader'
              case 'upc_e': return 'upc_e_reader'
              case 'code_93': return 'code_93_reader'
              case 'code_39_vin': return 'code_39_vin_reader'
              default: return 'code_128_reader'
            }
          })
        },
        locate: true,
        debug: {
          showCanvas: fullConfig.debug || false,
          showPatches: fullConfig.debug || false,
          showFoundPatches: fullConfig.debug || false,
          showSkeleton: fullConfig.debug || false,
          showLabels: fullConfig.debug || false,
          showPatchLabels: fullConfig.debug || false,
          showRemainingPatchLabels: fullConfig.debug || false,
          boxFromPatches: {
            showTransformed: fullConfig.debug || false,
            showTransformedBox: fullConfig.debug || false,
            showBB: fullConfig.debug || false
          }
        }
      }

      await new Promise<void>((resolve, reject) => {
        Quagga.init(quaggaConfig, (err) => {
          if (err) {
            console.error('Failed to initialize Quagga:', err)
            reject(err)
          } else {
            resolve()
          }
        })
      })

      // Set up event handlers
      Quagga.onDetected(this.handleDetection.bind(this))
      Quagga.onProcessed(this.handleProcessed.bind(this))

      this.isInitialized = true
      console.log('Advanced barcode scanner initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize scanner:', error)
      return false
    }
  }

  private handleDetection(result: any) {
    if (!this.isScanning) return

    const confidence = result.codeResult.decodedCodes
      .reduce((acc: number, code: any) => acc + (code.confidence || 0), 0) / result.codeResult.decodedCodes.length

    if (confidence < this.confidenceThreshold) {
      console.log(`Low confidence detection: ${confidence}% for ${result.codeResult.code}`)
      return
    }

    const scanResult: ScanResult = {
      code: result.codeResult.code,
      format: result.codeResult.format,
      confidence,
      timestamp: new Date(),
      rawData: result
    }

    // Add to history
    this.scanHistory.push(scanResult)
    if (this.scanHistory.length > 100) {
      this.scanHistory.shift() // Keep only last 100 scans
    }

    // Call callback if provided
    if (this.scanResultCallback) {
      this.scanResultCallback(scanResult)
    }

    console.log(`Barcode detected: ${scanResult.code} (${scanResult.format}) - ${confidence.toFixed(1)}% confidence`)
  }

  private handleProcessed(result: any) {
    // This is called for every frame processed, useful for debugging
    if (this.defaultConfig.debug) {
      console.log('Frame processed:', result)
    }
  }

  start(onScanResult?: (result: ScanResult) => void): boolean {
    if (!this.isInitialized) {
      console.error('Scanner not initialized')
      return false
    }

    if (this.isScanning) {
      console.warn('Scanner already running')
      return true
    }

    this.scanResultCallback = onScanResult
    this.isScanning = true
    Quagga.start()
    console.log('Scanner started')
    return true
  }

  stop(): void {
    if (!this.isScanning) return

    this.isScanning = false
    this.scanResultCallback = undefined
    Quagga.stop()
    console.log('Scanner stopped')
  }

  destroy(): void {
    this.stop()
    if (this.isInitialized) {
      Quagga.offDetected(this.handleDetection.bind(this))
      Quagga.offProcessed(this.handleProcessed.bind(this))
      this.isInitialized = false
    }
  }

  isRunning(): boolean {
    return this.isScanning
  }

  getScanHistory(): ScanResult[] {
    return [...this.scanHistory]
  }

  clearHistory(): void {
    this.scanHistory = []
  }

  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(100, threshold))
  }

  getConfidenceThreshold(): number {
    return this.confidenceThreshold
  }

  // Product lookup from various APIs
  async lookupProduct(barcode: string): Promise<ProductData | null> {
    try {
      // Try Open Food Facts first (good for food products)
      const productData = await this.lookupOpenFoodFacts(barcode)
      if (productData) {
        return productData
      }

      // Try UPC database as fallback
      const upcData = await this.lookupUPCDatabase(barcode)
      if (upcData) {
        return upcData
      }

      console.log(`No product data found for barcode: ${barcode}`)
      return null
    } catch (error) {
      console.error('Product lookup failed:', error)
      return null
    }
  }

  private async lookupOpenFoodFacts(barcode: string): Promise<ProductData | null> {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await response.json()

      if (data.status === 1 && data.product) {
        const product = data.product
        return {
          barcode,
          name: product.product_name || product.product_name_en,
          brand: product.brands,
          category: product.categories,
          description: product.generic_name || product.generic_name_en,
          imageUrl: product.image_url || product.image_front_url,
          nutrition: product.nutriments,
          ingredients: product.ingredients_text ? product.ingredients_text.split(',').map((i: string) => i.trim()) : [],
          allergens: product.allergens ? product.allergens.split(',').map((a: string) => a.trim()) : [],
          source: 'openfoodfacts'
        }
      }

      return null
    } catch (error) {
      console.error('Open Food Facts lookup failed:', error)
      return null
    }
  }

  private async lookupUPCDatabase(barcode: string): Promise<ProductData | null> {
    try {
      // This is a placeholder for UPC database lookup
      // You would need to implement this with a real UPC API service
      console.log(`UPC lookup for ${barcode} - not implemented yet`)
      return null
    } catch (error) {
      console.error('UPC database lookup failed:', error)
      return null
    }
  }

  // Validate barcode format
  validateBarcode(code: string, format: string): boolean {
    switch (format.toLowerCase()) {
      case 'ean_13':
        return this.validateEAN13(code)
      case 'ean_8':
        return this.validateEAN8(code)
      case 'upc_a':
        return this.validateUPCA(code)
      case 'upc_e':
        return this.validateUPCE(code)
      default:
        return code.length > 0 // Basic validation for other formats
    }
  }

  private validateEAN13(code: string): boolean {
    if (code.length !== 13 || !/^\d+$/.test(code)) return false

    const digits = code.split('').map(Number)
    const checksum = digits.pop()!
    
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3)
    }
    
    const calculatedChecksum = (10 - (sum % 10)) % 10
    return calculatedChecksum === checksum
  }

  private validateEAN8(code: string): boolean {
    if (code.length !== 8 || !/^\d+$/.test(code)) return false

    const digits = code.split('').map(Number)
    const checksum = digits.pop()!
    
    let sum = 0
    for (let i = 0; i < 7; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1)
    }
    
    const calculatedChecksum = (10 - (sum % 10)) % 10
    return calculatedChecksum === checksum
  }

  private validateUPCA(code: string): boolean {
    if (code.length !== 12 || !/^\d+$/.test(code)) return false

    const digits = code.split('').map(Number)
    const checksum = digits.pop()!
    
    let sum = 0
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1)
    }
    
    const calculatedChecksum = (10 - (sum % 10)) % 10
    return calculatedChecksum === checksum
  }

  private validateUPCE(code: string): boolean {
    return code.length === 8 && /^\d+$/.test(code)
  }

  // Generate statistics from scan history
  getStatistics(): {
    totalScans: number
    formatBreakdown: Record<string, number>
    averageConfidence: number
    topScannedCodes: { code: string; count: number }[]
    scanningTimeRange: { start?: Date; end?: Date }
  } {
    if (this.scanHistory.length === 0) {
      return {
        totalScans: 0,
        formatBreakdown: {},
        averageConfidence: 0,
        topScannedCodes: [],
        scanningTimeRange: {}
      }
    }

    const formatBreakdown: Record<string, number> = {}
    const codeCount: Record<string, number> = {}
    let totalConfidence = 0

    this.scanHistory.forEach(scan => {
      formatBreakdown[scan.format] = (formatBreakdown[scan.format] || 0) + 1
      codeCount[scan.code] = (codeCount[scan.code] || 0) + 1
      totalConfidence += scan.confidence
    })

    const topScannedCodes = Object.entries(codeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([code, count]) => ({ code, count }))

    return {
      totalScans: this.scanHistory.length,
      formatBreakdown,
      averageConfidence: totalConfidence / this.scanHistory.length,
      topScannedCodes,
      scanningTimeRange: {
        start: this.scanHistory[0]?.timestamp,
        end: this.scanHistory[this.scanHistory.length - 1]?.timestamp
      }
    }
  }
}

// Export singleton instance
export const advancedBarcodeScanner = new AdvancedBarcodeScanner()
