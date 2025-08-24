'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft,
  ChevronRight,
  QrCode,
  BarChart3,
  FileText,
  Printer,
  CheckCircle,
  Eye,
  Download,
  Zap,
  Settings,
  RefreshCw
} from 'lucide-react'

const steps = [
  { id: 1, title: 'Velg mal', description: 'Velg etikettmal' },
  { id: 2, title: 'Konfigurer data', description: 'Fyll ut etikettdata' },
  { id: 3, title: 'Velg skriver', description: 'Velg skriver og innstillinger' },
  { id: 4, title: 'Forhåndsvisning', description: 'Se og bekreft utskrift' }
]

const availableTemplates = [
  {
    id: 'standard_hms',
    name: 'Standard HMS Etikett',
    description: 'QR-kode med gjenstandsnavn og lokasjon',
    type: 'QR',
    size: 'STANDARD',
    variables: ['item.name', 'item.qrCode', 'location.name'],
    icon: QrCode
  },
  {
    id: 'compact',
    name: 'Kompakt Etikett',
    description: 'Minimal QR-kode for små gjenstander',
    type: 'QR',
    size: 'SMALL',
    variables: ['item.qrCode'],
    icon: QrCode
  },
  {
    id: 'detailed',
    name: 'Detaljert Inventar',
    description: 'QR + tekst + detaljer for viktige gjenstander',
    type: 'CUSTOM',
    size: 'LARGE',
    variables: ['item.name', 'item.qrCode', 'location.name', 'item.category', 'item.value'],
    icon: FileText
  },
  {
    id: 'barcode',
    name: 'Strekkode Etikett',
    description: 'Tradisjonell strekkode med produktnummer',
    type: 'BARCODE',
    size: 'STANDARD',
    variables: ['item.barcode', 'item.name'],
    icon: BarChart3
  }
]

const availablePrinters = [
  {
    id: 'pdf_export',
    name: 'PDF Eksport',
    type: 'PDF',
    status: 'online',
    location: 'Universell - fungerer med alle skrivere',
    description: 'Generer PDF-fil for utskrift på hvilken som helst skriver'
  },
  {
    id: 'html_preview',
    name: 'HTML Forhåndsvisning',
    type: 'HTML',
    status: 'online',
    location: 'Nettleser',
    description: 'Åpne i nettleser for direkte utskrift'
  },
  {
    id: 'zebra_zd420',
    name: 'Zebra ZD420',
    type: 'ZEBRA',
    status: 'online',
    location: 'Lager',
    description: 'Profesjonell ZPL-basert etikettskriver'
  },
  {
    id: 'brother_pt',
    name: 'Brother P-touch',
    type: 'BROTHER',
    status: 'online',
    location: 'Kontor',
    description: 'Brother P-touch etikettskriver'
  },
  {
    id: 'dymo_legacy',
    name: 'DYMO LabelWriter (Legacy)',
    type: 'DYMO',
    status: 'online',
    location: 'Arkiv',
    description: 'Eldre DYMO-skriver (krever plugin)'
  }
]

export function PrintWizardWireframe() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [labelData, setLabelData] = useState<Record<string, string>>({})
  const [printSettings, setPrintSettings] = useState({
    copies: 1,
    quality: 'high',
    cutMode: 'auto'
  })
  const [isPrinting, setIsPrinting] = useState(false)
  const [printComplete, setPrintComplete] = useState(false)

  const selectedTemplateData = availableTemplates.find(t => t.id === selectedTemplate)
  const selectedPrinterData = availablePrinters.find(p => p.id === selectedPrinter)

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2: return !!selectedTemplate
      case 3: return !!selectedTemplate && Object.keys(labelData).length > 0
      case 4: return !!selectedTemplate && !!selectedPrinter && Object.keys(labelData).length > 0
      default: return true
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    
    try {
      // Use the new universal printer service
      const { universalPrinterService } = await import('@/lib/printing/universal-printer-service')
      
      const result = await universalPrinterService.print({
        templateId: selectedTemplate,
        data: labelData,
        printerType: selectedPrinterData?.type as any || 'PDF',
        printSettings: {
          copies: printSettings.copies,
          quality: printSettings.quality as any
        }
      })
      
      if (result.success) {
        // If we have an output URL (PDF/HTML), open it
        if (result.outputUrl) {
          const link = document.createElement('a')
          link.href = result.outputUrl
          link.download = `${selectedTemplateData?.name || 'etikett'}_${Date.now()}.${
            selectedPrinterData?.type === 'PDF' ? 'pdf' : 'html'
          }`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        
        setPrintComplete(true)
      } else {
        throw new Error(result.error || 'Utskrift feilet')
      }
    } catch (error) {
      console.error('Print error:', error)
      alert(`Utskriftsfeil: ${error instanceof Error ? error.message : 'Ukjent feil'}`)
    } finally {
      setIsPrinting(false)
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setSelectedTemplate('')
    setSelectedPrinter('')
    setLabelData({})
    setPrintSettings({ copies: 1, quality: 'high', cutMode: 'auto' })
    setIsPrinting(false)
    setPrintComplete(false)
  }

  if (printComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-green-600">Utskrift vellykket!</h2>
            <p className="text-muted-foreground mt-2">
              {printSettings.copies} etikett{printSettings.copies !== 1 ? 'er' : ''} er sendt til {selectedPrinterData?.name}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Utskriftsdetaljer:</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Mal:</span>
                <span>{selectedTemplateData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Skriver:</span>
                <span>{selectedPrinterData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Antall:</span>
                <span>{printSettings.copies}</span>
              </div>
              <div className="flex justify-between">
                <span>Kvalitet:</span>
                <span className="capitalize">{printSettings.quality}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={resetWizard} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Skriv ut mer
            </Button>
            <Button asChild>
              <a href="/printing">
                Tilbake til dashboard
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <CardTitle>
            {steps[currentStep - 1]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Velg en etikettmal for utskrift. Du kan også opprette en ny mal hvis ingen passer.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                {availableTemplates.map((template) => {
                  const IconComponent = template.icon
                  return (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {template.description}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="secondary">{template.type}</Badge>
                              <Badge variant="outline">{template.size}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {selectedTemplate && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Variabler i denne malen:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplateData?.variables.map((variable) => (
                      <Badge key={variable} variant="outline">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Data Configuration */}
          {currentStep === 2 && selectedTemplateData && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Fyll ut dataene som skal brukes i etiketten. Disse verdiene vil erstatte variablene i malen.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {selectedTemplateData.variables.map((variable) => (
                  <div key={variable}>
                    <Label htmlFor={variable}>
                      {(variable.split('.').pop() || variable).charAt(0).toUpperCase() + (variable.split('.').pop() || variable).slice(1)}
                    </Label>
                    <Input
                      id={variable}
                      value={labelData[variable] || ''}
                      onChange={(e) => setLabelData(prev => ({
                        ...prev,
                        [variable]: e.target.value
                      }))}
                      placeholder={`Skriv inn ${variable}`}
                    />
                  </div>
                ))}
              </div>

              {Object.keys(labelData).length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Forhåndsvisning av data:</h4>
                  <div className="text-sm space-y-1">
                    {Object.entries(labelData).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{value || '(tom)'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Printer Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Velg skriver og konfigurer utskriftsinnstillinger.
              </p>

              {/* Printer Selection */}
              <div>
                <Label className="text-base font-medium">Tilgjengelige skrivere</Label>
                <div className="grid gap-3 mt-3">
                  {availablePrinters.map((printer) => (
                    <Card 
                      key={printer.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPrinter === printer.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedPrinter(printer.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Printer className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{printer.name}</h4>
                              <p className="text-sm text-muted-foreground">{printer.location}</p>
                              {printer.description && (
                                <p className="text-xs text-muted-foreground mt-1">{printer.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={printer.status === 'online' ? 'default' : 'destructive'}>
                              {printer.status === 'online' ? 'Online' : 'Offline'}
                            </Badge>
                            <Badge variant="outline">{printer.type}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Print Settings */}
              {selectedPrinter && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Utskriftsinnstillinger</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="copies">Antall kopier</Label>
                      <Input
                        id="copies"
                        type="number"
                        min="1"
                        max="100"
                        value={printSettings.copies}
                        onChange={(e) => setPrintSettings(prev => ({
                          ...prev,
                          copies: parseInt(e.target.value) || 1
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label>Kvalitet</Label>
                      <Select 
                        value={printSettings.quality} 
                        onValueChange={(value) => setPrintSettings(prev => ({
                          ...prev,
                          quality: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Utkast</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Høy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Kuttemodus</Label>
                      <Select 
                        value={printSettings.cutMode} 
                        onValueChange={(value) => setPrintSettings(prev => ({
                          ...prev,
                          cutMode: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Automatisk</SelectItem>
                          <SelectItem value="manual">Manuell</SelectItem>
                          <SelectItem value="none">Ingen kutt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Preview & Print */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Kontroller alle detaljer før utskrift. Du kan gå tilbake for å gjøre endringer.
              </p>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Forhåndsvisning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                    <div className="inline-block p-4 bg-white border shadow-sm rounded">
                      <div className="text-xs text-muted-foreground mb-2">
                        {selectedTemplateData?.name} • {selectedTemplateData?.size}
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedTemplateData?.type === 'QR' && (
                          <div className="w-16 h-16 bg-black rounded flex items-center justify-center text-white text-xs">
                            QR
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-medium text-sm">
                            {labelData['item.name'] || 'Gjenstandsnavn'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {labelData['location.name'] || 'Lokasjon'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Utskriftssammendrag</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Mal</Label>
                      <p className="text-sm">{selectedTemplateData?.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Skriver</Label>
                      <p className="text-sm">{selectedPrinterData?.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Antall kopier</Label>
                      <p className="text-sm">{printSettings.copies}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Kvalitet</Label>
                      <p className="text-sm capitalize">{printSettings.quality}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Etikettdata</Label>
                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      {Object.entries(labelData).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Tilbake
        </Button>

        <div className="text-sm text-muted-foreground">
          Steg {currentStep} av {steps.length}
        </div>

        {currentStep < steps.length ? (
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={!canProceedToStep(currentStep + 1)}
          >
            Neste
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handlePrint}
            disabled={!canProceedToStep(currentStep) || isPrinting}
          >
            {isPrinting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Skriver ut...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Skriv ut
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}