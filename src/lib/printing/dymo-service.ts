// Optional dymo import - will be handled gracefully if not available
let dymo: any = null

// Dynamic import approach for better Next.js compatibility
const loadDymoSDK = async (): Promise<any> => {
  try {
    if (typeof window !== 'undefined') {
      // Check if DYMO is already available globally
      if ((window as any).dymo) {
        return (window as any).dymo
      }
      
      // Try dynamic import
      try {
        const dymoModule = await import('dymo-js-sdk')
        return dymoModule.default || dymoModule
      } catch (importError) {
        console.warn('Dynamic DYMO import failed, trying require fallback')
        // Fallback to require
        return require('dymo-js-sdk')
      }
    }
    return null
  } catch (error) {
    console.warn('DYMO SDK not available - printing features will be disabled', error)
    return null
  }
}

export interface LabelData {
  itemName: string
  locationName: string
  qrCode: string
  categoryName?: string
  dateAdded?: string
  barcode?: string
  householdName?: string
}

export interface PrintOptions {
  printerName?: string
  copies?: number
  labelSize?: 'small' | 'standard' | 'large'
  jobTitle?: string
  flowDirection?: 'LeftToRight' | 'RightToLeft'
  alignment?: 'Left' | 'Center' | 'Right'
}

class DymoService {
  private isInitialized = false
  private availablePrinters: string[] = []

  async initialize(): Promise<boolean> {
    try {
      // Load DYMO SDK dynamically
      if (!dymo) {
        dymo = await loadDymoSDK()
      }
      
      if (!dymo || !dymo.label || !dymo.label.framework) {
        console.warn('DYMO SDK not available')
        this.isInitialized = false
        return false
      }

      // Check if DYMO Label Web Service is running
      const isServiceRunning = await dymo.label.framework.checkEnvironment()
      
      if (!isServiceRunning.isFrameworkInstalled) {
        console.warn('DYMO Label Framework is not installed')
        this.isInitialized = false
        return false
      }
      
      if (!isServiceRunning.isWebServicePresent) {
        console.warn('DYMO Label Web Service is not running')
        this.isInitialized = false
        return false
      }

      // Get available printers
      await this.refreshPrinters()
      
      this.isInitialized = true
      console.log('DYMO service initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize DYMO service:', error)
      this.isInitialized = false
      return false
    }
  }

  async refreshPrinters(): Promise<string[]> {
    try {
      // Ensure DYMO SDK is loaded
      if (!dymo) {
        dymo = await loadDymoSDK()
      }
      
      if (!dymo || !dymo.label || !dymo.label.framework) {
        console.warn('DYMO SDK not available for printer refresh')
        this.availablePrinters = []
        return []
      }

      const printers = await dymo.label.framework.getPrinters()
      this.availablePrinters = printers
        .filter((printer: any) => printer.isConnected && printer.isLocal)
        .map((printer: any) => printer.name)
      
      console.log('Available DYMO printers:', this.availablePrinters)
      return this.availablePrinters
    } catch (error) {
      console.error('Failed to get DYMO printers:', error)
      this.availablePrinters = []
      return []
    }
  }

  getAvailablePrinters(): string[] {
    return this.availablePrinters
  }

  isReady(): boolean {
    return this.isInitialized && this.availablePrinters.length > 0
  }

  // Force reinitialization
  async forceReinitialize(): Promise<boolean> {
    this.isInitialized = false
    this.availablePrinters = []
    return this.initialize()
  }

  // Standard QR label template
  private getQRLabelTemplate(size: 'small' | 'standard' | 'large' = 'standard'): string {
    const paperMap: Record<'small'|'standard'|'large', { id: string; name: string }> = {
      small: { id: 'Address', name: '30334 Multi-purpose' },
      standard: { id: 'Address', name: '30252 Address' },
      large: { id: 'Address', name: '30323 Shipping' }
    }
    const paper = paperMap[size]
    return `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips" MediaType="Default">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>${paper.id}</Id>
  <PaperName>${paper.name}</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <TextObject>
      <Name>ITEM_NAME</Name>
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
          <String>ITEM_NAME</String>
          <Attributes>
            <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="100" Y="100" Width="1381" Height="600" />
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>LOCATION_NAME</Name>
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
          <String>LOCATION_NAME</String>
          <Attributes>
            <Font Family="Arial" Size="10" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="64" Green="64" Blue="64" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="100" Y="750" Width="1381" Height="400" />
  </ObjectInfo>
  <ObjectInfo>
    <BarcodeObject>
      <Name>QR_CODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>QR_CODE</Text>
      <Type>QRCode</Type>
      <Size>Large</Size>
      <TextPosition>None</TextPosition>
      <TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
      <CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
      <TextEmbedding>None</TextEmbedding>
      <ECLevel>0</ECLevel>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" />
    </BarcodeObject>
    <Bounds X="100" Y="1200" Width="1381" Height="1381" />
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>DATE_ADDED</Name>
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
          <String>DATE_ADDED</String>
          <Attributes>
            <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="128" Green="128" Blue="128" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="100" Y="2650" Width="1381" Height="300" />
  </ObjectInfo>
</DieCutLabel>`
  }

  // Barcode label template
  private getBarcodeLabelTemplate(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips" MediaType="Default">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <TextObject>
      <Name>ITEM_NAME</Name>
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
          <String>ITEM_NAME</String>
          <Attributes>
            <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="100" Y="100" Width="1381" Height="600" />
  </ObjectInfo>
  <ObjectInfo>
    <BarcodeObject>
      <Name>BARCODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>BARCODE</Text>
      <Type>Code128Auto</Type>
      <Size>Medium</Size>
      <TextPosition>Bottom</TextPosition>
      <TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
      <CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
      <TextEmbedding>None</TextEmbedding>
      <ECLevel>0</ECLevel>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" />
    </BarcodeObject>
    <Bounds X="100" Y="800" Width="1381" Height="800" />
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>LOCATION_NAME</Name>
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
          <String>LOCATION_NAME</String>
          <Attributes>
            <Font Family="Arial" Size="10" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="64" Green="64" Blue="64" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="100" Y="1700" Width="1381" Height="400" />
  </ObjectInfo>
</DieCutLabel>`
  }

  async printQRLabel(data: LabelData, options: PrintOptions = {}): Promise<boolean> {
    // Try to initialize if not ready
    if (!this.isReady()) {
      const initialized = await this.initialize()
      if (!initialized || !this.isReady()) {
        // Try one more time with force reinitialization
        const forceInitialized = await this.forceReinitialize()
        if (!forceInitialized || !this.isReady()) {
          throw new Error('DYMO service not ready. Please ensure DYMO Connect is running and a printer is connected.')
        }
      }
    }

    try {
      const template = this.getQRLabelTemplate(options.labelSize || 'standard')
      const label = dymo.label.framework.openLabelXml(template)

      // Set label data
      label.setObjectText('ITEM_NAME', data.itemName)
      label.setObjectText('LOCATION_NAME', data.locationName)
      label.setObjectText('QR_CODE', data.qrCode)
      label.setObjectText('DATE_ADDED', data.dateAdded || new Date().toLocaleDateString('nb-NO'))

      // Get printer name
      const printerName = options.printerName || this.availablePrinters[0]
      if (!printerName) {
        throw new Error('No printer available')
      }

      // Print parameters
      const printParams = dymo.label.framework.createLabelWriterPrintParamsXml({
        copies: options.copies || 1,
        jobTitle: options.jobTitle || `QR Label - ${data.itemName}`,
        flowDirection: options.flowDirection || 'LeftToRight',
        alignment: options.alignment || 'Center'
      })

      // Print the label
      await dymo.label.framework.printLabel(printerName, printParams, label.getLabelXml())
      
      console.log(`Successfully printed QR label for: ${data.itemName}`)
      return true
    } catch (error) {
      console.error('Failed to print QR label:', error)
      throw error
    }
  }

  async printBarcodeLabel(data: LabelData, options: PrintOptions = {}): Promise<boolean> {
    // Try to initialize if not ready
    if (!this.isReady()) {
      const initialized = await this.initialize()
      if (!initialized || !this.isReady()) {
        // Try one more time with force reinitialization
        const forceInitialized = await this.forceReinitialize()
        if (!forceInitialized || !this.isReady()) {
          throw new Error('DYMO service not ready. Please ensure DYMO Connect is running and a printer is connected.')
        }
      }
    }

    if (!data.barcode) {
      throw new Error('Barcode is required for barcode labels')
    }

    try {
      const template = this.getBarcodeLabelTemplate()
      const label = dymo.label.framework.openLabelXml(template)

      // Set label data
      label.setObjectText('ITEM_NAME', data.itemName)
      label.setObjectText('BARCODE', data.barcode)
      label.setObjectText('LOCATION_NAME', data.locationName)

      // Get printer name
      const printerName = options.printerName || this.availablePrinters[0]
      if (!printerName) {
        throw new Error('No printer available')
      }

      // Print parameters
      const printParams = dymo.label.framework.createLabelWriterPrintParamsXml({
        copies: options.copies || 1,
        jobTitle: options.jobTitle || `Barcode Label - ${data.itemName}`,
        flowDirection: options.flowDirection || 'LeftToRight',
        alignment: options.alignment || 'Center'
      })

      // Print the label
      await dymo.label.framework.printLabel(printerName, printParams, label.getLabelXml())
      
      console.log(`Successfully printed barcode label for: ${data.itemName}`)
      return true
    } catch (error) {
      console.error('Failed to print barcode label:', error)
      throw error
    }
  }

  // Bulk print multiple labels
  async printBulkLabels(
    labelDataArray: LabelData[], 
    labelType: 'qr' | 'barcode' = 'qr',
    options: PrintOptions = {}
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    // Try to initialize if not ready
    if (!this.isReady()) {
      const initialized = await this.initialize()
      if (!initialized || !this.isReady()) {
        // Try one more time with force reinitialization
        const forceInitialized = await this.forceReinitialize()
        if (!forceInitialized || !this.isReady()) {
          throw new Error('DYMO service not ready. Please ensure DYMO Connect is running and a printer is connected.')
        }
      }
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const labelData of labelDataArray) {
      try {
        if (labelType === 'qr') {
          await this.printQRLabel(labelData, options)
        } else {
          await this.printBarcodeLabel(labelData, options)
        }
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`${labelData.itemName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return results
  }

  // Preview label (returns base64 image)
  async previewLabel(data: LabelData, labelType: 'qr' | 'barcode' = 'qr'): Promise<string> {
    // default preview uses standard unless options are supplied via overload (kept below)
    try {
      const template = labelType === 'qr' ? this.getQRLabelTemplate('standard') : this.getBarcodeLabelTemplate()
      const label = dymo.label.framework.openLabelXml(template)

      // Set label data
      label.setObjectText('ITEM_NAME', data.itemName)
      label.setObjectText('LOCATION_NAME', data.locationName)
      
      if (labelType === 'qr') {
        label.setObjectText('QR_CODE', data.qrCode)
        label.setObjectText('DATE_ADDED', data.dateAdded || new Date().toLocaleDateString('nb-NO'))
      } else {
        if (!data.barcode) {
          throw new Error('Barcode is required for barcode preview')
        }
        label.setObjectText('BARCODE', data.barcode)
      }

      // Render preview
      const previewParams = dymo.label.framework.createLabelRenderParamsXml({
        labelColor: dymo.label.framework.LabelColor.BlackOnWhite,
        shadowDepth: 0,
        flowDirection: dymo.label.framework.FlowDirection.LeftToRight
      })

      const base64Image = await dymo.label.framework.renderLabel(label.getLabelXml(), previewParams, 'image/png')
      return base64Image
    } catch (error) {
      console.error('Failed to preview label:', error)
      throw error
    }
  }

  // Overload-like helper to pass options for preview (e.g., labelSize)
  async previewLabelWithOptions(data: LabelData, labelType: 'qr' | 'barcode' = 'qr', options: PrintOptions = {}): Promise<string> {
    try {
      const template = labelType === 'qr' ? this.getQRLabelTemplate(options.labelSize || 'standard') : this.getBarcodeLabelTemplate()
      const label = dymo.label.framework.openLabelXml(template)

      label.setObjectText('ITEM_NAME', data.itemName)
      label.setObjectText('LOCATION_NAME', data.locationName)
      if (labelType === 'qr') {
        label.setObjectText('QR_CODE', data.qrCode)
        label.setObjectText('DATE_ADDED', data.dateAdded || new Date().toLocaleDateString('nb-NO'))
      } else {
        if (!data.barcode) throw new Error('Barcode is required for barcode preview')
        label.setObjectText('BARCODE', data.barcode)
      }

      const previewParams = dymo.label.framework.createLabelRenderParamsXml({
        labelColor: dymo.label.framework.LabelColor.BlackOnWhite,
        shadowDepth: 0,
        flowDirection: dymo.label.framework.FlowDirection.LeftToRight
      })
      const base64Image = await dymo.label.framework.renderLabel(label.getLabelXml(), previewParams, 'image/png')
      return base64Image
    } catch (error) {
      console.error('Failed to preview label with options:', error)
      throw error
    }
  }

  // Check service status
  async getServiceStatus(): Promise<{
    isFrameworkInstalled: boolean
    isWebServicePresent: boolean
    version: string
    availablePrinters: string[]
  }> {
    try {
      const environment = await dymo.label.framework.checkEnvironment()
      await this.refreshPrinters()
      
      return {
        isFrameworkInstalled: environment.isFrameworkInstalled,
        isWebServicePresent: environment.isWebServicePresent,
        version: environment.versionInfo || 'Unknown',
        availablePrinters: this.availablePrinters
      }
    } catch (error) {
      console.error('Failed to get service status:', error)
      return {
        isFrameworkInstalled: false,
        isWebServicePresent: false,
        version: 'Unknown',
        availablePrinters: []
      }
    }
  }

  // Print location label (wrapper method for compatibility)
  async printLocationLabel(location: any, options: PrintOptions = {}): Promise<boolean> {
    // Try to initialize if not ready
    if (!this.isReady()) {
      const initialized = await this.initialize()
      if (!initialized || !this.isReady()) {
        // Try one more time with force reinitialization
        const forceInitialized = await this.forceReinitialize()
        if (!forceInitialized || !this.isReady()) {
          throw new Error('DYMO service not ready. Please ensure DYMO Connect is running and a printer is connected.')
        }
      }
    }

    const labelData: LabelData = {
      itemName: location.name,
      locationName: location.description || location.type || 'Lokasjon',
      qrCode: location.qrCode,
      dateAdded: new Date().toLocaleDateString('nb-NO')
    }
    
    return this.printQRLabel(labelData, options)
  }

  // Print multiple location labels
  async printMultipleLabels(locations: any[], options: PrintOptions = {}): Promise<boolean> {
    // Try to initialize if not ready
    if (!this.isReady()) {
      const initialized = await this.initialize()
      if (!initialized || !this.isReady()) {
        // Try one more time with force reinitialization
        const forceInitialized = await this.forceReinitialize()
        if (!forceInitialized || !this.isReady()) {
          throw new Error('DYMO service not ready. Please ensure DYMO Connect is running and a printer is connected.')
        }
      }
    }

    const labelDataArray: LabelData[] = locations.map(location => ({
      itemName: location.name,
      locationName: location.description || location.type || 'Lokasjon',
      qrCode: location.qrCode,
      dateAdded: new Date().toLocaleDateString('nb-NO')
    }))
    
    const results = await this.printBulkLabels(labelDataArray, 'qr', options)
    
    if (results.failed > 0) {
      console.error('Some labels failed to print:', results.errors)
      throw new Error(`${results.failed} etiketter kunne ikke skrives ut`)
    }
    
    return true
  }
}

// Export singleton instance
export const dymoService = new DymoService()