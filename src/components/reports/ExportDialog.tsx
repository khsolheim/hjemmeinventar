'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, FileText, Table, Shield, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [exportType, setExportType] = useState<'inventory' | 'insurance' | 'analytics'>('inventory')
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [includeImages, setIncludeImages] = useState(false)
  const [includePrivateData, setIncludePrivateData] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const exportData = trpc.importExport.exportData.useMutation({
    onSuccess: (data: any) => {
      generateAndDownloadFile(data)
      setIsGenerating(false)
      toast.success('Eksport fullført')
      onClose()
    },
    onError: (error: any) => {
      toast.error(`Eksport feilet: ${error.message}`)
      setIsGenerating(false)
    }
  })

  const generateAndDownloadFile = (data: any) => {
    let content = ''
    let filename = ''
    let mimeType = ''

    const timestamp = new Date().toISOString().split('T')[0]

    switch (format) {
      case 'csv':
        content = convertToCSV(data.data)
        filename = `${exportType}-export-${timestamp}.csv`
        mimeType = 'text/csv'
        break
      case 'excel':
        // For now, generate CSV with Excel-friendly formatting
        content = convertToExcelCSV(data.data)
        filename = `${exportType}-export-${timestamp}.csv`
        mimeType = 'text/csv'
        break
      case 'pdf':
        content = generatePDFContent(data)
        filename = `${exportType}-rapport-${timestamp}.pdf`
        mimeType = 'application/pdf'
        break
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  const convertToExcelCSV = (data: any[]) => {
    // Add UTF-8 BOM for proper Excel encoding
    const bom = '\uFEFF'
    return bom + convertToCSV(data)
  }

  const generatePDFContent = (data: any) => {
    // For now, generate HTML content that can be converted to PDF
    // In a real implementation, you'd use a PDF library like jsPDF or Puppeteer
    const html = generateHTMLReport(data)
    return html
  }

  const generateHTMLReport = (data: any) => {
    const timestamp = new Date().toLocaleDateString('nb-NO')
    
    if (exportType === 'insurance') {
      return generateInsuranceReport(data, timestamp)
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hjemmeinventar Rapport</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #ccc; }
          h2 { color: #666; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>📦 Hjemmeinventar Rapport</h1>
        <div class="summary">
          <h2>Sammendrag</h2>
          <p><strong>Rapport generert:</strong> ${timestamp}</p>
          <p><strong>Totalt antall gjenstander:</strong> ${data.data.length}</p>
          <p><strong>Rapport type:</strong> ${exportType === 'inventory' ? 'Inventar oversikt' : 'Analytics rapport'}</p>
        </div>
        
        <h2>Detaljert oversikt</h2>
        <table>
          <thead>
            <tr>
              ${Object.keys(data.data[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.data.map((item: any) => `
              <tr>
                ${Object.values(item).map(value => `<td>${value || '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generert av Hjemmeinventar applikasjonen - ${timestamp}</p>
          <p>Dette dokumentet inneholder en oversikt over registrerte gjenstander og er ikke juridisk bindende.</p>
        </div>
      </body>
      </html>
    `
  }

  const generateInsuranceReport = (data: any, timestamp: string) => {
    const totalValue = data.data.reduce((sum: number, item: any) => sum + (parseFloat(item.pris) || 0), 0)
    const itemsWithValue = data.data.filter((item: any) => item.pris && parseFloat(item.pris) > 0)
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Forsikringsrapport - Hjemmeinventar</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { color: #2563eb; margin-bottom: 10px; }
          .summary-box { background: #f8fafc; border: 2px solid #e2e8f0; padding: 20px; margin: 20px 0; }
          .value-highlight { font-size: 24px; font-weight: bold; color: #dc2626; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .category-group { margin: 30px 0; }
          .important-note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ FORSIKRINGSRAPPORT</h1>
          <h2>Hjemmeinventar Dokumentasjon</h2>
          <p><strong>Rapportdato:</strong> ${timestamp}</p>
        </div>
        
        <div class="summary-box">
          <h2>📊 Sammendrag av verdier</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p><strong>Totalt antall gjenstander:</strong> ${data.data.length}</p>
              <p><strong>Gjenstander med verdi:</strong> ${itemsWithValue.length}</p>
              <p><strong>Gjenstander uten verdi:</strong> ${data.data.length - itemsWithValue.length}</p>
            </div>
            <div>
              <p><strong>Total estimert verdi:</strong></p>
              <div class="value-highlight">${totalValue.toLocaleString('nb-NO')} NOK</div>
            </div>
          </div>
        </div>
        
        <div class="important-note">
          <h3>⚠️ Viktig informasjon for forsikring</h3>
          <ul>
            <li>Dette dokumentet er en oversikt over registrerte gjenstander per ${timestamp}</li>
            <li>Verdier er estimerte og basert på registrerte kjøpspriser</li>
            <li>For høyverdige gjenstander anbefales det med dokumentasjon av kvitteringer</li>
            <li>Kontakt din forsikringsselskap for spesifikke krav til dokumentasjon</li>
          </ul>
        </div>
        
        <h2>📋 Detaljert inventarliste</h2>
        <table>
          <thead>
            <tr>
              <th>Gjenstand</th>
              <th>Kategori</th>
              <th>Lokasjon</th>
              <th>Antall</th>
              <th>Kjøpspris (NOK)</th>
              <th>Kjøpsdato</th>
              <th>Beskrivelse</th>
            </tr>
          </thead>
          <tbody>
            ${data.data.map((item: any) => `
              <tr style="${item.pris && parseFloat(item.pris) > 5000 ? 'background-color: #fef3c7;' : ''}">
                <td><strong>${item.navn || 'Ukjent'}</strong></td>
                <td>${item.kategori || 'Ukategorisert'}</td>
                <td>${item.lokasjon || 'Ukjent lokasjon'}</td>
                <td>${item.antall || 1}</td>
                <td>${item.pris ? parseFloat(item.pris).toLocaleString('nb-NO') : 'Ikke oppgitt'}</td>
                <td>${item.kjøpsdato || 'Ikke oppgitt'}</td>
                <td>${item.beskrivelse || 'Ingen beskrivelse'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary-box">
          <h2>💰 Verdikategorier</h2>
          <table style="margin: 0;">
            <tr>
              <td><strong>Gjenstander over 10,000 NOK:</strong></td>
              <td>${itemsWithValue.filter((item: any) => parseFloat(item.pris) > 10000).length}</td>
            </tr>
            <tr>
              <td><strong>Gjenstander 5,000-10,000 NOK:</strong></td>
              <td>${itemsWithValue.filter((item: any) => parseFloat(item.pris) >= 5000 && parseFloat(item.pris) <= 10000).length}</td>
            </tr>
            <tr>
              <td><strong>Gjenstander 1,000-5,000 NOK:</strong></td>
              <td>${itemsWithValue.filter((item: any) => parseFloat(item.pris) >= 1000 && parseFloat(item.pris) < 5000).length}</td>
            </tr>
            <tr>
              <td><strong>Gjenstander under 1,000 NOK:</strong></td>
              <td>${itemsWithValue.filter((item: any) => parseFloat(item.pris) < 1000).length}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p><strong>Rapportgenerator:</strong> Hjemmeinventar - Digital inventarsystem</p>
          <p><strong>Kontaktinformasjon:</strong> Dette dokumentet er generert automatisk basert på registrerte data.</p>
          <p><strong>Versjon:</strong> 1.0 - ${timestamp}</p>
          <hr>
          <p style="font-style: italic;">
            Denne rapporten er utarbeidet som dokumentasjon for forsikringsformål. 
            Kontroller at alle verdier er oppdaterte og korrekte før innsending til forsikringsselskap.
          </p>
        </div>
      </body>
      </html>
    `
  }

  const handleExport = () => {
    setIsGenerating(true)
    exportData.mutate({
      template: 'INVENTORY_FULL',
      format: 'json' // Always request JSON from backend
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Eksporter data
          </DialogTitle>
          <DialogDescription>
            Generer rapporter og eksporter inventardata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Rapport type</Label>
            <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Inventar oversikt
                  </div>
                </SelectItem>
                <SelectItem value="insurance">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Forsikringsrapport
                  </div>
                </SelectItem>
                <SelectItem value="analytics">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Analytics rapport
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Kommaseparert)</SelectItem>
                <SelectItem value="excel">Excel format</SelectItem>
                <SelectItem value="pdf">PDF rapport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeImages" 
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(!!checked)}
              />
              <Label htmlFor="includeImages">Inkluder bilde-URLer</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includePrivateData" 
                checked={includePrivateData}
                onCheckedChange={(checked) => setIncludePrivateData(!!checked)}
              />
              <Label htmlFor="includePrivateData">Inkluder alle detaljer</Label>
            </div>
          </div>

          {exportType === 'insurance' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🛡️ Forsikringsrapport</h4>
              <p className="text-sm text-blue-700">
                Denne rapporten inneholder fullstendig dokumentasjon for forsikringsformål, 
                inkludert verdiestimat og kategorisering av gjenstander.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleExport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Genererer...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Eksporter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
