/**
 * Universal Printer Service - Modern Non-DYMO-Locked Architecture
 * Supports multiple printer brands and output formats
 */

export interface UniversalTemplate {
  id: string
  name: string
  format: 'HTML_CSS' | 'SVG' | 'PDF' | 'ZPL' | 'EPL' | 'DPL' | 'XML'
  content: string
  variables: string[]
  dimensions: {
    width: number
    height: number
    unit: 'mm' | 'px' | 'pt'
  }
  metadata?: {
    brand?: string
    category?: string
    description?: string
  }
}

export interface PrintRequest {
  templateId: string
  data: Record<string, string>
  printerType: 'PDF' | 'HTML' | 'DYMO' | 'BROTHER' | 'ZEBRA' | 'GENERIC'
  printSettings: {
    copies?: number
    quality?: 'draft' | 'normal' | 'high'
    orientation?: 'portrait' | 'landscape'
    margins?: { top: number; right: number; bottom: number; left: number }
  }
}

export interface PrintResult {
  success: boolean
  jobId?: string
  outputUrl?: string // For PDF/HTML exports
  error?: string
  metadata?: {
    outputFormat: string
    fileSize?: number
    duration?: number
  }
}

// HTML/CSS Template Generator
class HTMLTemplateRenderer {
  static render(template: UniversalTemplate, data: Record<string, string>): string {
    let content = template.content
    
    // Replace variables with actual data
    template.variables.forEach(variable => {
      const value = data[variable] || `{{${variable}}}`
      content = content.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value)
    })

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${template.name}</title>
        <style>
          @page {
            size: ${template.dimensions.width}${template.dimensions.unit} ${template.dimensions.height}${template.dimensions.unit};
            margin: 0;
          }
          body {
            margin: 0;
            padding: 8px;
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            width: ${template.dimensions.width}${template.dimensions.unit};
            height: ${template.dimensions.height}${template.dimensions.unit};
            box-sizing: border-box;
          }
          .qr-code {
            width: 60px;
            height: 60px;
            background: black;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          }
          .barcode {
            height: 30px;
            background: repeating-linear-gradient(
              to right,
              black 0px,
              black 2px,
              white 2px,
              white 4px
            );
            display: inline-block;
            width: 100px;
          }
          .label-container {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 100%;
          }
          .text-content {
            flex: 1;
          }
          .item-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 2px;
          }
          .item-location {
            color: #666;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `
  }
}

// PDF Generator
class PDFRenderer {
  static async generatePDF(htmlContent: string): Promise<Blob> {
    // In a real implementation, this would use a library like jsPDF or Puppeteer
    // For demo purposes, we'll create a simple text representation
    
    const textContent = htmlContent
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 100] /Contents 4 0 R >>
endobj

4 0 obj
<< /Length ${textContent.length} >>
stream
BT
/F1 12 Tf
10 80 Td
(${textContent}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
0000000200 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
300
%%EOF`

    return new Blob([pdfContent], { type: 'application/pdf' })
  }
}

// ZPL (Zebra Programming Language) Generator
class ZPLRenderer {
  static render(template: UniversalTemplate, data: Record<string, string>): string {
    const width = Math.round(template.dimensions.width * 8) // Convert mm to dots (8 dots/mm)
    const height = Math.round(template.dimensions.height * 8)

    let zplContent = `^XA\n^LH0,0\n^FO0,0^GB${width},${height},2^FS\n`

    // Add QR code if template contains QR data
    const qrData = data['item.qrCode'] || data['qrCode']
    if (qrData) {
      zplContent += `^FO20,20^BQN,2,4^FDQA,${qrData}^FS\n`
    }

    // Add text elements
    const itemName = data['item.name'] || data['name'] || 'Item'
    const location = data['location.name'] || data['location'] || ''

    zplContent += `^FO120,30^A0N,20,20^FD${itemName}^FS\n`
    if (location) {
      zplContent += `^FO120,60^A0N,15,15^FD${location}^FS\n`
    }

    zplContent += '^XZ'
    return zplContent
  }
}

// Brother P-touch Template Generator
class BrotherDPLRenderer {
  static render(template: UniversalTemplate, data: Record<string, string>): string {
    // Brother DPL command example
    let dplContent = '\x1B\x69\x61\x01' // Initialize

    const itemName = data['item.name'] || data['name'] || 'Item'
    const location = data['location.name'] || data['location'] || ''

    // Text commands for Brother printers
    dplContent += '\x1B\x69\x4D\x40' // Set margins
    dplContent += `\x1B\x69\x53\x32${itemName}\n` // Large text
    if (location) {
      dplContent += `\x1B\x69\x53\x31${location}\n` // Small text
    }
    
    dplContent += '\x1A' // Print and feed

    return dplContent
  }
}

// Main Universal Printer Service
export class UniversalPrinterService {
  private static instance: UniversalPrinterService
  private templates: Map<string, UniversalTemplate> = new Map()

  static getInstance(): UniversalPrinterService {
    if (!this.instance) {
      this.instance = new UniversalPrinterService()
      this.instance.initializeDefaultTemplates()
    }
    return this.instance
  }

  private initializeDefaultTemplates() {
    // Standard HMS Template
    this.templates.set('standard_hms', {
      id: 'standard_hms',
      name: 'Standard HMS Etikett',
      format: 'HTML_CSS',
      variables: ['item.name', 'item.qrCode', 'location.name'],
      dimensions: { width: 54, height: 25, unit: 'mm' },
      content: `
        <div class="label-container">
          <div class="qr-code">QR</div>
          <div class="text-content">
            <div class="item-name">{{item.name}}</div>
            <div class="item-location">{{location.name}}</div>
          </div>
        </div>
      `
    })

    // Compact Template
    this.templates.set('compact', {
      id: 'compact',
      name: 'Kompakt Etikett',
      format: 'HTML_CSS',
      variables: ['item.qrCode'],
      dimensions: { width: 30, height: 15, unit: 'mm' },
      content: `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
          <div class="qr-code" style="width: 40px; height: 40px;">QR</div>
        </div>
      `
    })

    // Detailed Template
    this.templates.set('detailed', {
      id: 'detailed',
      name: 'Detaljert Inventar',
      format: 'HTML_CSS',
      variables: ['item.name', 'item.qrCode', 'location.name', 'item.category', 'item.value'],
      dimensions: { width: 89, height: 36, unit: 'mm' },
      content: `
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; height: 100%;">
          <div class="qr-code">QR</div>
          <div>
            <div class="item-name">{{item.name}}</div>
            <div class="item-location">{{location.name}}</div>
            <div style="font-size: 9px; color: #888; margin-top: 2px;">
              {{item.category}} • {{item.value}}
            </div>
          </div>
        </div>
      `
    })

    // Barcode Template
    this.templates.set('barcode', {
      id: 'barcode',
      name: 'Strekkode Etikett',
      format: 'HTML_CSS',
      variables: ['item.barcode', 'item.name'],
      dimensions: { width: 54, height: 25, unit: 'mm' },
      content: `
        <div style="text-align: center; padding: 4px;">
          <div class="barcode" style="margin: 0 auto 4px;"></div>
          <div style="font-size: 10px; font-weight: bold;">{{item.name}}</div>
          <div style="font-size: 8px; color: #666;">{{item.barcode}}</div>
        </div>
      `
    })
  }

  async print(request: PrintRequest): Promise<PrintResult> {
    try {
      const template = this.templates.get(request.templateId)
      if (!template) {
        throw new Error(`Template ${request.templateId} not found`)
      }

      const jobId = `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      switch (request.printerType) {
        case 'PDF':
          return await this.printToPDF(template, request.data, jobId)
        
        case 'HTML':
          return await this.printToHTML(template, request.data, jobId)
        
        case 'ZEBRA':
          return await this.printToZebra(template, request.data, jobId)
        
        case 'BROTHER':
          return await this.printToBrother(template, request.data, jobId)
        
        case 'DYMO':
          return await this.printToDymo(template, request.data, jobId)
        
        default:
          return await this.printToHTML(template, request.data, jobId)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private async printToPDF(template: UniversalTemplate, data: Record<string, string>, jobId: string): Promise<PrintResult> {
    const htmlContent = HTMLTemplateRenderer.render(template, data)
    const pdfBlob = await PDFRenderer.generatePDF(htmlContent)
    
    // In a real implementation, you would save this to a file or send to printer
    const url = URL.createObjectURL(pdfBlob)
    
    return {
      success: true,
      jobId,
      outputUrl: url,
      metadata: {
        outputFormat: 'PDF',
        fileSize: pdfBlob.size,
        duration: 50
      }
    }
  }

  private async printToHTML(template: UniversalTemplate, data: Record<string, string>, jobId: string): Promise<PrintResult> {
    const htmlContent = HTMLTemplateRenderer.render(template, data)
    
    // Create a downloadable HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    return {
      success: true,
      jobId,
      outputUrl: url,
      metadata: {
        outputFormat: 'HTML',
        fileSize: blob.size,
        duration: 25
      }
    }
  }

  private async printToZebra(template: UniversalTemplate, data: Record<string, string>, jobId: string): Promise<PrintResult> {
    const zplContent = ZPLRenderer.render(template, data)
    
    // In a real implementation, this would send ZPL commands to a Zebra printer
    console.log('ZPL Output:', zplContent)
    
    return {
      success: true,
      jobId,
      metadata: {
        outputFormat: 'ZPL',
        duration: 150
      }
    }
  }

  private async printToBrother(template: UniversalTemplate, data: Record<string, string>, jobId: string): Promise<PrintResult> {
    const dplContent = BrotherDPLRenderer.render(template, data)
    
    // In a real implementation, this would send DPL commands to a Brother printer
    console.log('DPL Output:', dplContent)
    
    return {
      success: true,
      jobId,
      metadata: {
        outputFormat: 'DPL',
        duration: 120
      }
    }
  }

  private async printToDymo(template: UniversalTemplate, data: Record<string, string>, jobId: string): Promise<PrintResult> {
    // Convert to DYMO XML format
    const dymoXml = this.convertToDymoXML(template, data)
    
    // In a real implementation, this would use the DYMO service
    console.log('DYMO XML:', dymoXml)
    
    return {
      success: true,
      jobId,
      metadata: {
        outputFormat: 'DYMO_XML',
        duration: 100
      }
    }
  }

  private convertToDymoXML(template: UniversalTemplate, data: Record<string, string>): string {
    // Convert HTML template to DYMO XML format
    const itemName = data['item.name'] || 'Item'
    const location = data['location.name'] || ''
    
    return `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <TextObject>
      <Name>TEXT</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <GroupID>-1</GroupID>
      <IsOutlined>False</IsOutlined>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>${itemName}${location ? '\n' + location : ''}</String>
          <Attributes>
            <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`
  }

  getTemplate(templateId: string): UniversalTemplate | undefined {
    return this.templates.get(templateId)
  }

  getAllTemplates(): UniversalTemplate[] {
    return Array.from(this.templates.values())
  }

  addTemplate(template: UniversalTemplate): void {
    this.templates.set(template.id, template)
  }

  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId)
  }

  // Get supported printer types
  getSupportedPrinterTypes(): Array<{type: string, name: string, description: string}> {
    return [
      { type: 'PDF', name: 'PDF Eksport', description: 'Generer PDF-fil for universal utskrift' },
      { type: 'HTML', name: 'HTML Preview', description: 'Vis i nettleser for utskrift' },
      { type: 'DYMO', name: 'DYMO LabelWriter', description: 'DYMO etikettskrivere' },
      { type: 'BROTHER', name: 'Brother P-touch', description: 'Brother P-touch etikettskrivere' },
      { type: 'ZEBRA', name: 'Zebra ZPL', description: 'Zebra ZPL-kompatible skrivere' },
      { type: 'GENERIC', name: 'Generisk skriver', description: 'Standard skriver via HTML/CSS' }
    ]
  }
}

export const universalPrinterService = UniversalPrinterService.getInstance()
