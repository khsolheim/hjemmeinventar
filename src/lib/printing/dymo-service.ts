/**
 * DYMO Label Framework Integration Service
 * Provides abstraction layer for DYMO.js printer communication
 */

declare global {
  interface Window {
    dymo: {
      label: {
        framework: {
          init: () => Promise<void>
          getPrinters: () => any[]
          openLabelFile: (xmlData: string) => any
          printLabel: (printer: string, printParameters: string, labelXml: string, labelData: string) => void
          printLabel2: (printer: string, printParameters: string, labelXml: string, labelData: string) => Promise<void>
          checkEnvironment: () => {
            framework: boolean
            printers: boolean
            addIn: boolean
          }
          trace: boolean
        }
      }
    }
  }
}

export interface DymoPrinter {
  name: string
  modelName: string
  isConnected: boolean
  isLocal: boolean
  isTwinTurbo: boolean
  printerType: string
}

export interface DymoLabelData {
  [key: string]: string
}

export interface DymoPrintSettings {
  copies: number
  jobTitle?: string
  flowDirection?: 'LeftToRight' | 'RightToLeft'
  alignment?: 'Left' | 'Center' | 'Right'
  cutMode?: 'AutoCut' | 'ChainMarks' | 'NoCut'
  rollFeedMode?: 'AutoFeed' | 'NoFeed'
  twinTurboRoll?: 'Left' | 'Right' | 'Auto'
}

export interface PrinterStatus {
  isOnline: boolean
  paperStatus: 'Ready' | 'Empty' | 'Jam'
  lastError?: string
  capabilities: {
    maxWidth: number
    maxHeight: number
    resolution: number
    supportedMediaTypes: string[]
  }
}

class DymoService {
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null
  private printers: DymoPrinter[] = []

  /**
   * Initialize DYMO Label Framework
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this.performInitialization()
    return this.initializationPromise
  }

  private async performInitialization(): Promise<void> {
    try {
      // Check if running in browser
      if (typeof window === 'undefined') {
        throw new Error('DYMO service can only run in browser environment')
      }

      // Load DYMO framework if not already loaded
      if (!window.dymo) {
        await this.loadDymoFramework()
      }

      // Initialize framework
      await window.dymo.label.framework.init()

      // Check environment
      const env = window.dymo.label.framework.checkEnvironment()
      if (!env.framework) {
        throw new Error('DYMO Label Framework not available')
      }

      if (!env.printers) {
        console.warn('No DYMO printers detected')
      }

      this.isInitialized = true
      await this.refreshPrinters()

    } catch (error) {
      console.error('Failed to initialize DYMO service:', error)
      throw new Error(`DYMO initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Load DYMO Framework JavaScript
   */
  private async loadDymoFramework(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if DYMO framework script already exists
      if (document.querySelector('script[src*="DYMO.Label.Framework"]')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://labelwriter.com/software/dls/sdk/js/DYMO.Label.Framework.latest.js'
      script.type = 'text/javascript'
      
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load DYMO framework'))
      
      document.head.appendChild(script)
    })
  }

  /**
   * Get all available DYMO printers
   */
  async getPrinters(): Promise<DymoPrinter[]> {
    await this.initialize()
    return this.printers
  }

  /**
   * Refresh printer list
   */
  async refreshPrinters(): Promise<DymoPrinter[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      const rawPrinters = window.dymo.label.framework.getPrinters()
      this.printers = rawPrinters.map(printer => ({
        name: printer.name,
        modelName: printer.modelName,
        isConnected: printer.isConnected,
        isLocal: printer.isLocal,
        isTwinTurbo: printer.isTwinTurbo,
        printerType: printer.printerType
      }))

      return this.printers
    } catch (error) {
      console.error('Failed to refresh printers:', error)
      return []
    }
  }

  /**
   * Check if specific printer is available
   */
  async isPrinterAvailable(printerName: string): Promise<boolean> {
    const printers = await this.getPrinters()
    return printers.some(p => p.name === printerName && p.isConnected)
  }

  /**
   * Get printer status and capabilities
   */
  async getPrinterStatus(printerName: string): Promise<PrinterStatus | null> {
    try {
      const printers = await this.getPrinters()
      const printer = printers.find(p => p.name === printerName)
      
      if (!printer) {
        return null
      }

      // Basic status - DYMO framework has limited status reporting
      return {
        isOnline: printer.isConnected,
        paperStatus: printer.isConnected ? 'Ready' : 'Empty',
        capabilities: {
          maxWidth: this.getMaxWidthForModel(printer.modelName),
          maxHeight: 1000, // Most DYMO printers support continuous labels
          resolution: this.getResolutionForModel(printer.modelName),
          supportedMediaTypes: this.getSupportedMediaTypes(printer.modelName)
        }
      }
    } catch (error) {
      console.error('Failed to get printer status:', error)
      return null
    }
  }

  /**
   * Print label with DYMO printer
   */
  async printLabel(
    printerName: string,
    labelXml: string,
    labelData: DymoLabelData,
    settings: Partial<DymoPrintSettings> = {}
  ): Promise<{ success: boolean; error?: string; jobId?: string }> {
    try {
      await this.initialize()

      // Check if printer is available
      const isAvailable = await this.isPrinterAvailable(printerName)
      if (!isAvailable) {
        throw new Error(`Printer "${printerName}" is not available or connected`)
      }

      // Prepare print parameters
      const printParams = this.buildPrintParameters(settings)
      
      // Convert label data to XML format
      const labelDataXml = this.buildLabelDataXml(labelData)

      // Generate job ID for tracking
      const jobId = `dymo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      try {
        // Use newer async API if available, fallback to sync
        if (window.dymo.label.framework.printLabel2) {
          await window.dymo.label.framework.printLabel2(
            printerName,
            printParams,
            labelXml,
            labelDataXml
          )
        } else {
          window.dymo.label.framework.printLabel(
            printerName,
            printParams,
            labelXml,
            labelDataXml
          )
        }

        return {
          success: true,
          jobId
        }
      } catch (printError) {
        throw new Error(`Print failed: ${printError instanceof Error ? printError.message : 'Unknown error'}`)
      }

    } catch (error) {
      console.error('DYMO print error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Test printer connection with a simple test label
   */
  async testPrinter(printerName: string): Promise<{ success: boolean; error?: string }> {
    const testLabelXml = `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <TextObject>
      <Name>TEST_TEXT</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>TEST PRINT</String>
          <Attributes>
            <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="332" Y="150" Width="4455" Height="1260" />
  </ObjectInfo>
</DieCutLabel>`

    const testData = {
      TEST_TEXT: `Test Print - ${new Date().toLocaleTimeString('no-NO')}`
    }

    return await this.printLabel(printerName, testLabelXml, testData, { copies: 1 })
  }

  /**
   * Generate label template for common label types
   */
  generateLabelTemplate(labelType: 'address' | 'shipping' | 'barcode' | 'qr', size: 'small' | 'medium' | 'large' = 'medium'): string {
    const templates = {
      address: this.getAddressTemplate(size),
      shipping: this.getShippingTemplate(size),
      barcode: this.getBarcodeTemplate(size),
      qr: this.getQRTemplate(size)
    }

    return templates[labelType] || templates.address
  }

  /**
   * Validate label XML format
   */
  validateLabelXml(labelXml: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(labelXml, 'text/xml')
      
      // Check for parsing errors
      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        errors.push('Invalid XML format')
      }

      // Check for required elements
      if (!doc.querySelector('DieCutLabel')) {
        errors.push('Missing DieCutLabel root element')
      }

      if (!doc.querySelector('PaperName')) {
        errors.push('Missing PaperName element')
      }

    } catch (error) {
      errors.push('XML parsing failed')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Private helper methods

  private buildPrintParameters(settings: Partial<DymoPrintSettings>): string {
    const defaults: DymoPrintSettings = {
      copies: 1,
      jobTitle: 'Hjemmeinventar Print Job',
      flowDirection: 'LeftToRight',
      alignment: 'Center',
      cutMode: 'AutoCut',
      rollFeedMode: 'AutoFeed',
      twinTurboRoll: 'Auto'
    }

    const finalSettings = { ...defaults, ...settings }

    return `<?xml version="1.0" encoding="utf-8"?>
<PrintParameters>
  <Copies>${finalSettings.copies}</Copies>
  <JobTitle>${finalSettings.jobTitle}</JobTitle>
  <FlowDirection>${finalSettings.flowDirection}</FlowDirection>
  <Alignment>${finalSettings.alignment}</Alignment>
  <CutMode>${finalSettings.cutMode}</CutMode>
  <RollFeedMode>${finalSettings.rollFeedMode}</RollFeedMode>
  <TwinTurboRoll>${finalSettings.twinTurboRoll}</TwinTurboRoll>
</PrintParameters>`
  }

  private buildLabelDataXml(data: DymoLabelData): string {
    let xml = '<?xml version="1.0" encoding="utf-8"?><LabelData>'
    
    for (const [key, value] of Object.entries(data)) {
      xml += `<ObjectData Name="${key}" Value="${this.escapeXml(value)}" />`
    }
    
    xml += '</LabelData>'
    return xml
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  private getMaxWidthForModel(model: string): number {
    const widths: Record<string, number> = {
      'LabelWriter 450': 2.3 * 72, // 2.3 inches in points
      'LabelWriter 450 Turbo': 2.3 * 72,
      'LabelWriter 550': 2.3 * 72,
      'LabelWriter 550 Turbo': 2.3 * 72,
      'LabelWriter 4XL': 4.16 * 72 // 4.16 inches in points
    }
    return widths[model] || 2.3 * 72
  }

  private getResolutionForModel(model: string): number {
    const resolutions: Record<string, number> = {
      'LabelWriter 450': 600,
      'LabelWriter 450 Turbo': 600,
      'LabelWriter 550': 600,
      'LabelWriter 550 Turbo': 600,
      'LabelWriter 4XL': 300
    }
    return resolutions[model] || 600
  }

  private getSupportedMediaTypes(model: string): string[] {
    const mediaTypes: Record<string, string[]> = {
      'LabelWriter 450': ['Address', 'Shipping', 'File Folder', 'Name Badge'],
      'LabelWriter 450 Turbo': ['Address', 'Shipping', 'File Folder', 'Name Badge'],
      'LabelWriter 550': ['Address', 'Shipping', 'File Folder', 'Name Badge', 'CD/DVD'],
      'LabelWriter 550 Turbo': ['Address', 'Shipping', 'File Folder', 'Name Badge', 'CD/DVD'],
      'LabelWriter 4XL': ['Large Address', 'Large Shipping', '4x6 Photo']
    }
    return mediaTypes[model] || ['Address', 'Shipping']
  }

  private getAddressTemplate(size: string): string {
    // Return appropriate template based on size
    return `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands/>
  <ObjectInfo>
    <TextObject>
      <Name>ADDRESS_TEXT</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText/>
    </TextObject>
    <Bounds X="332" Y="150" Width="4455" Height="1260" />
  </ObjectInfo>
</DieCutLabel>`
  }

  private getShippingTemplate(size: string): string {
    // Similar to address but larger format
    return this.getAddressTemplate(size)
  }

  private getBarcodeTemplate(size: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Barcode</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands/>
  <ObjectInfo>
    <BarcodeObject>
      <Name>BARCODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>123456789</Text>
      <Type>Code128Auto</Type>
      <Size>Medium</Size>
      <TextPosition>Bottom</TextPosition>
      <TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
    </BarcodeObject>
    <Bounds X="332" Y="150" Width="4455" Height="1260" />
  </ObjectInfo>
</DieCutLabel>`
  }

  private getQRTemplate(size: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>QRCode</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands/>
  <ObjectInfo>
    <QRCodeObject>
      <Name>QRCODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>https://example.com</Text>
      <Size>Medium</Size>
      <ErrorCorrection>Medium</ErrorCorrection>
    </QRCodeObject>
    <Bounds X="332" Y="150" Width="2000" Height="2000" />
  </ObjectInfo>
</DieCutLabel>`
  }
}

// Export singleton instance
export const dymoService = new DymoService()
export default dymoService