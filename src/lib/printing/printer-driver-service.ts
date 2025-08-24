/**
 * Universal Printer Driver Service
 * Abstracts different printer types and provides unified interface
 */

import { dymoService, type DymoPrinter, type DymoLabelData, type DymoPrintSettings } from './dymo-service'

export type PrinterBrand = 'DYMO' | 'ZEBRA' | 'BROTHER' | 'UNKNOWN'
export type ConnectionType = 'NETWORK' | 'USB' | 'BLUETOOTH'

export interface UniversalPrinter {
  id: string
  name: string
  brand: PrinterBrand
  model: string
  connectionType: ConnectionType
  isConnected: boolean
  isLocal: boolean
  capabilities: PrinterCapabilities
  status: PrinterStatus
  ipAddress?: string
  port?: string
}

export interface PrinterCapabilities {
  maxWidth: number // in points (1/72 inch)
  maxHeight: number
  minWidth: number
  minHeight: number
  resolution: number // DPI
  supportedMediaTypes: string[]
  supportedFormats: string[] // ['XML', 'ZPL', 'EPL', etc.]
  canCut: boolean
  canPeel: boolean
  hasSensors: boolean
}

export interface PrinterStatus {
  isOnline: boolean
  paperStatus: 'Ready' | 'Empty' | 'Jam' | 'Unknown'
  inkLevel?: number // 0-100
  paperLevel?: number // 0-100
  temperature?: number
  lastError?: string
  jobsInQueue: number
}

export interface PrintJob {
  id: string
  printerName: string
  templateData: any
  labelData: any
  settings: PrintSettings
  status: 'QUEUED' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
}

export interface PrintSettings {
  copies: number
  jobTitle?: string
  priority?: 'low' | 'normal' | 'high'
  // Print quality
  resolution?: number
  darkness?: number // 0-100
  speed?: number // 0-100
  // Paper handling
  cutMode?: 'auto' | 'manual' | 'none'
  peelMode?: 'auto' | 'manual' | 'none'
  // Orientation and alignment
  orientation?: 'portrait' | 'landscape'
  alignment?: 'left' | 'center' | 'right'
  // Advanced
  mirror?: boolean
  negative?: boolean
}

export interface LabelTemplate {
  id: string
  name: string
  brand: PrinterBrand
  format: string // 'DYMO_XML', 'ZPL', 'EPL', etc.
  width: number
  height: number
  content: string
  variables: string[]
  preview?: string // base64 image
}

class PrinterDriverService {
  private drivers: Map<PrinterBrand, any> = new Map()
  private printers: Map<string, UniversalPrinter> = new Map()
  private printQueue: PrintJob[] = []
  private isProcessingQueue = false

  constructor() {
    // Initialize available drivers
    this.initializeDrivers()
  }

  /**
   * Initialize printer drivers
   */
  private initializeDrivers() {
    // DYMO driver
    this.drivers.set('DYMO', dymoService)
    
    // Placeholder for other drivers
    // this.drivers.set('ZEBRA', zebraService)
    // this.drivers.set('BROTHER', brotherService)
  }

  /**
   * Discover all available printers
   */
  async discoverPrinters(): Promise<UniversalPrinter[]> {
    const allPrinters: UniversalPrinter[] = []

    // Discover DYMO printers
    try {
      const dymoDriver = this.drivers.get('DYMO')
      if (dymoDriver) {
        const dymoPrinters = await dymoDriver.getPrinters()
        const universalPrinters = await Promise.all(
          dymoPrinters.map(async (p: DymoPrinter) => this.convertDymoToUniversal(p))
        )
        allPrinters.push(...universalPrinters)
      }
    } catch (error) {
      console.warn('Failed to discover DYMO printers:', error)
    }

    // TODO: Discover other printer types
    // Zebra, Brother, etc.

    // Update internal cache
    this.printers.clear()
    allPrinters.forEach(printer => {
      this.printers.set(printer.id, printer)
    })

    return allPrinters
  }

  /**
   * Get all discovered printers
   */
  getPrinters(): UniversalPrinter[] {
    return Array.from(this.printers.values())
  }

  /**
   * Get printer by ID
   */
  getPrinter(printerId: string): UniversalPrinter | null {
    return this.printers.get(printerId) || null
  }

  /**
   * Get printers by brand
   */
  getPrintersByBrand(brand: PrinterBrand): UniversalPrinter[] {
    return this.getPrinters().filter(p => p.brand === brand)
  }

  /**
   * Check if printer is available
   */
  async isPrinterAvailable(printerId: string): Promise<boolean> {
    const printer = this.getPrinter(printerId)
    if (!printer) return false

    const driver = this.drivers.get(printer.brand)
    if (!driver) return false

    try {
      if (printer.brand === 'DYMO') {
        return await driver.isPrinterAvailable(printer.name)
      }
      // TODO: Add other driver checks
      return printer.isConnected
    } catch (error) {
      console.error('Failed to check printer availability:', error)
      return false
    }
  }

  /**
   * Get current printer status
   */
  async getPrinterStatus(printerId: string): Promise<PrinterStatus | null> {
    const printer = this.getPrinter(printerId)
    if (!printer) return null

    const driver = this.drivers.get(printer.brand)
    if (!driver) return null

    try {
      if (printer.brand === 'DYMO') {
        const status = await driver.getPrinterStatus(printer.name)
        return status ? this.convertDymoStatusToUniversal(status) : null
      }
      // TODO: Add other driver status checks
      return printer.status
    } catch (error) {
      console.error('Failed to get printer status:', error)
      return null
    }
  }

  /**
   * Test printer connection
   */
  async testPrinter(printerId: string): Promise<{ success: boolean; error?: string }> {
    const printer = this.getPrinter(printerId)
    if (!printer) {
      return { success: false, error: 'Printer not found' }
    }

    const driver = this.drivers.get(printer.brand)
    if (!driver) {
      return { success: false, error: 'Driver not available' }
    }

    try {
      if (printer.brand === 'DYMO') {
        return await driver.testPrinter(printer.name)
      }
      // TODO: Add other driver test methods
      return { success: false, error: 'Test not implemented for this printer type' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Print label with universal interface
   */
  async printLabel(
    printerId: string,
    template: LabelTemplate,
    data: Record<string, any>,
    settings: Partial<PrintSettings> = {}
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    const printer = this.getPrinter(printerId)
    if (!printer) {
      return { success: false, error: 'Printer not found' }
    }

    // Check if printer is available
    const isAvailable = await this.isPrinterAvailable(printerId)
    if (!isAvailable) {
      return { success: false, error: 'Printer is not available or connected' }
    }

    // Create print job
    const job: PrintJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      printerName: printer.name,
      templateData: template,
      labelData: data,
      settings: { copies: 1, ...settings },
      status: 'QUEUED',
      createdAt: new Date()
    }

    // Add to queue
    this.printQueue.push(job)

    // Process queue
    this.processQueue()

    return { success: true, jobId: job.id }
  }

  /**
   * Process print queue
   */
  private async processQueue() {
    if (this.isProcessingQueue) return

    this.isProcessingQueue = true

    while (this.printQueue.length > 0) {
      const job = this.printQueue.shift()
      if (!job) break

      await this.executeJob(job)
    }

    this.isProcessingQueue = false
  }

  /**
   * Execute individual print job
   */
  private async executeJob(job: PrintJob): Promise<void> {
    try {
      job.status = 'PRINTING'
      job.startedAt = new Date()

      const printer = Array.from(this.printers.values())
        .find(p => p.name === job.printerName)

      if (!printer) {
        throw new Error('Printer not found')
      }

      const driver = this.drivers.get(printer.brand)
      if (!driver) {
        throw new Error('Driver not available')
      }

      // Execute based on printer brand
      let result: { success: boolean; error?: string; jobId?: string }

      if (printer.brand === 'DYMO') {
        // Convert universal settings to DYMO settings
        const dymoSettings: Partial<DymoPrintSettings> = {
          copies: job.settings.copies,
          jobTitle: job.settings.jobTitle,
          alignment: job.settings.alignment === 'left' ? 'Left' : 
                     job.settings.alignment === 'right' ? 'Right' : 'Center',
          cutMode: job.settings.cutMode === 'auto' ? 'AutoCut' : 
                   job.settings.cutMode === 'none' ? 'NoCut' : 'AutoCut'
        }

        result = await driver.printLabel(
          printer.name,
          job.templateData.content,
          job.labelData,
          dymoSettings
        )
      } else {
        // TODO: Handle other printer types
        result = { success: false, error: 'Printer type not yet supported' }
      }

      if (result.success) {
        job.status = 'COMPLETED'
        job.completedAt = new Date()
      } else {
        job.status = 'FAILED'
        job.errorMessage = result.error
        job.completedAt = new Date()
      }

    } catch (error) {
      job.status = 'FAILED'
      job.errorMessage = error instanceof Error ? error.message : 'Unknown error'
      job.completedAt = new Date()
    }
  }

  /**
   * Get print queue status
   */
  getQueueStatus(): {
    queued: number
    printing: number
    completed: number
    failed: number
    jobs: PrintJob[]
  } {
    const jobs = this.printQueue
    return {
      queued: jobs.filter(j => j.status === 'QUEUED').length,
      printing: jobs.filter(j => j.status === 'PRINTING').length,
      completed: jobs.filter(j => j.status === 'COMPLETED').length,
      failed: jobs.filter(j => j.status === 'FAILED').length,
      jobs: [...jobs]
    }
  }

  /**
   * Cancel print job
   */
  cancelJob(jobId: string): boolean {
    const jobIndex = this.printQueue.findIndex(j => j.id === jobId)
    if (jobIndex >= 0) {
      const job = this.printQueue[jobIndex]
      if (job && job.status === 'QUEUED') {
        job.status = 'CANCELLED'
        job.completedAt = new Date()
        return true
      }
    }
    return false
  }

  /**
   * Generate label template for different printer types
   */
  generateTemplate(
    brand: PrinterBrand,
    templateType: 'address' | 'shipping' | 'barcode' | 'qr',
    size: 'small' | 'medium' | 'large' = 'medium'
  ): LabelTemplate | null {
    const driver = this.drivers.get(brand)
    if (!driver) return null

    try {
      if (brand === 'DYMO') {
        const content = driver.generateLabelTemplate(templateType, size)
        return {
          id: `${brand.toLowerCase()}_${templateType}_${size}`,
          name: `${brand} ${templateType} (${size})`,
          brand,
          format: 'DYMO_XML',
          width: this.getTemplateWidth(templateType, size),
          height: this.getTemplateHeight(templateType, size),
          content,
          variables: this.extractTemplateVariables(content),
          preview: undefined
        }
      }
      // TODO: Add other template generators
      return null
    } catch (error) {
      console.error('Failed to generate template:', error)
      return null
    }
  }

  /**
   * Validate template format
   */
  validateTemplate(template: LabelTemplate): { valid: boolean; errors: string[] } {
    const driver = this.drivers.get(template.brand)
    if (!driver) {
      return { valid: false, errors: ['Driver not available'] }
    }

    try {
      if (template.brand === 'DYMO') {
        return driver.validateLabelXml(template.content)
      }
      // TODO: Add other validation methods
      return { valid: true, errors: [] }
    } catch (error) {
      return { valid: false, errors: ['Validation failed'] }
    }
  }

  // Helper methods for converting between driver-specific and universal formats

  private async convertDymoToUniversal(dymoPrinter: DymoPrinter): Promise<UniversalPrinter> {
    const capabilities = this.getDymoCapabilities(dymoPrinter.modelName)
    
    return {
      id: `dymo_${dymoPrinter.name.replace(/\s+/g, '_').toLowerCase()}`,
      name: dymoPrinter.name,
      brand: 'DYMO',
      model: dymoPrinter.modelName,
      connectionType: this.mapDymoConnectionType(dymoPrinter),
      isConnected: dymoPrinter.isConnected,
      isLocal: dymoPrinter.isLocal,
      capabilities,
      status: {
        isOnline: dymoPrinter.isConnected,
        paperStatus: dymoPrinter.isConnected ? 'Ready' : 'Unknown',
        jobsInQueue: 0
      }
    }
  }

  private mapDymoConnectionType(dymoPrinter: DymoPrinter): ConnectionType {
    if (dymoPrinter.printerType?.includes('Network')) return 'NETWORK'
    if (dymoPrinter.printerType?.includes('USB')) return 'USB'
    if (dymoPrinter.printerType?.includes('Bluetooth')) return 'BLUETOOTH'
    return 'USB' // Default assumption for DYMO
  }

  private getDymoCapabilities(model: string): PrinterCapabilities {
    // Define capabilities based on model
    const baseCapabilities: PrinterCapabilities = {
      maxWidth: 2.3 * 72, // 2.3 inches in points
      maxHeight: 1000,
      minWidth: 0.5 * 72,
      minHeight: 0.5 * 72,
      resolution: 600,
      supportedMediaTypes: ['Address', 'Shipping', 'File Folder'],
      supportedFormats: ['DYMO_XML'],
      canCut: true,
      canPeel: false,
      hasSensors: true
    }

    // Adjust based on specific model
    if (model.includes('4XL')) {
      baseCapabilities.maxWidth = 4.16 * 72
      baseCapabilities.resolution = 300
      baseCapabilities.supportedMediaTypes.push('Large Format', '4x6 Photo')
    }

    if (model.includes('550')) {
      baseCapabilities.supportedMediaTypes.push('CD/DVD')
    }

    return baseCapabilities
  }

  private convertDymoStatusToUniversal(dymoStatus: any): PrinterStatus {
    return {
      isOnline: dymoStatus.isOnline,
      paperStatus: dymoStatus.paperStatus,
      lastError: dymoStatus.lastError,
      jobsInQueue: 0 // DYMO doesn't provide queue info
    }
  }

  private getTemplateWidth(type: string, size: string): number {
    const sizes = {
      small: 1.5 * 72,
      medium: 2.3 * 72,
      large: 4.0 * 72
    }
    return sizes[size as keyof typeof sizes] || sizes.medium
  }

  private getTemplateHeight(type: string, size: string): number {
    const heights = {
      small: 0.5 * 72,
      medium: 1.0 * 72,
      large: 2.0 * 72
    }
    return heights[size as keyof typeof heights] || heights.medium
  }

  private extractTemplateVariables(content: string): string[] {
    const variables: string[] = []
    const regex = /<Name>([^<]+)<\/Name>/g
    let match

    while ((match = regex.exec(content)) !== null) {
      const name = match[1]
      if (name && !variables.includes(name)) {
        variables.push(name)
      }
    }

    return variables
  }
}

// Export singleton instance
export const printerDriverService = new PrinterDriverService()
export default printerDriverService