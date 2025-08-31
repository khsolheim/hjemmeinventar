'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  Zap,
  RefreshCw,
  Package,
  MapPin
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useSession } from 'next-auth/react'

const steps = [
  { id: 1, title: 'Velg mal', description: 'Velg etikettmal' },
  { id: 2, title: 'Velg gjenstander', description: 'Velg gjenstander å etikettere' },
  { id: 3, title: 'Konfigurer data', description: 'Fyll ut etikettdata' },
  { id: 4, title: 'Velg skriver', description: 'Velg skriver og innstillinger' },
  { id: 5, title: 'Forhåndsvisning', description: 'Se og bekreft utskrift' }
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
  const { status } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const [labelData, setLabelData] = useState<Record<string, string>>({})
  const [printSettings, setPrintSettings] = useState({
    copies: 1,
    quality: 'high',
    cutMode: 'auto'
  })
  const [isPrinting, setIsPrinting] = useState(false)
  const [printComplete, setPrintComplete] = useState(false)

  // Fetch real data from the system
  const { data: itemsData } = trpc.items.getAll.useQuery({ limit: 1000 }, { enabled: status === 'authenticated' })
  // const { data: locationsData } = trpc.locations.getAll.useQuery({}, { enabled: status === 'authenticated' })

  const selectedTemplateData = availableTemplates.find(t => t.id === selectedTemplate)
  const selectedPrinterData = availablePrinters.find(p => p.id === selectedPrinter)

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2: return !!selectedTemplate
      case 3: return !!selectedTemplate && selectedItems.length > 0
      case 4: return !!selectedTemplate && selectedItems.length > 0 && Object.keys(labelData).length > 0
      case 5: return !!selectedTemplate && selectedItems.length > 0 && !!selectedPrinter && Object.keys(labelData).length > 0
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
        printerType: (selectedPrinterData?.type as 'PDF' | 'HTML' | 'ZEBRA' | 'BROTHER' | 'DYMO') || 'PDF',
        printSettings: {
          copies: printSettings.copies,
          quality: printSettings.quality as 'draft' | 'normal' | 'high'
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
    setSelectedItems([])

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
    <div className="space-y-4">
      {/* Progress Steps */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-1" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>
            {steps[currentStep - 1]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="h-full flex flex-col space-y-4">
              <p className="text-muted-foreground flex-shrink-0">
                Velg en etikettmal for utskrift. Du kan også opprette en ny mal hvis ingen passer.
              </p>
              
              <div className="grid gap-6 lg:grid-cols-2 flex-1 min-h-0">
                {/* Left Column: Template List */}
                <div className="flex flex-col space-y-3 min-h-0">
                  <h3 className="font-medium text-lg flex-shrink-0">Tilgjengelige maler</h3>
                  <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                    {availableTemplates.map((template) => {
                      const IconComponent = template.icon
                      return (
                        <Card 
                          key={template.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg">
                                <IconComponent className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{template.name}</h4>
                                <p className="text-xs text-muted-foreground mb-1.5">
                                  {template.description}
                                </p>
                                <div className="flex gap-1.5">
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{template.type}</Badge>
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">{template.size}</Badge>
                                </div>
                              </div>
                              {selectedTemplate === template.id && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Right Column: Template Preview */}
                <div className="flex flex-col space-y-3 min-h-0">
                  <h3 className="font-medium text-lg flex-shrink-0">Forhåndsvisning</h3>
                  {selectedTemplate && selectedTemplateData ? (
                    <div className="space-y-4 overflow-y-auto flex-1">
                      {/* Preview Card */}
                      <Card className="border-2 border-dashed border-blue-200">
                        <CardContent className="p-6">
                          <div className="aspect-[2/1] bg-white border rounded-lg p-4 flex items-center justify-center relative overflow-hidden">
                            {/* Mock label preview based on template type */}
                            {selectedTemplateData.type === 'QR' && (
                              <div className="flex items-center gap-4 w-full">
                                {/* QR Code mockup */}
                                <div className="w-16 h-16 bg-black flex-shrink-0 rounded">
                                  <div className="w-full h-full bg-gradient-to-br from-black via-gray-800 to-black opacity-90 rounded flex items-center justify-center">
                                    <QrCode className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                {/* Text content */}
                                <div className="flex-1 space-y-1">
                                  <div className="font-bold text-sm">{'{{item.name}}'}</div>
                                  <div className="text-xs text-gray-600">{'{{location.name}}'}</div>
                                  {selectedTemplateData.size === 'LARGE' && (
                                    <div className="text-xs text-gray-500">{'{{item.category}}'}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {selectedTemplateData.type === 'BARCODE' && (
                              <div className="w-full space-y-2">
                                {/* Barcode mockup */}
                                <div className="w-full h-8 bg-black flex items-end justify-center">
                                  <div className="flex h-full items-end space-x-px">
                                    {Array.from({length: 20}).map((_, i) => (
                                      <div key={i} className={`bg-black ${i % 3 === 0 ? 'h-full' : i % 2 === 0 ? 'h-3/4' : 'h-1/2'}`} style={{width: '2px'}}></div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-center text-xs font-mono">{'{{item.barcode}}'}</div>
                                <div className="text-center text-sm font-medium">{'{{item.name}}'}</div>
                              </div>
                            )}

                            {selectedTemplateData.type === 'CUSTOM' && (
                              <div className="w-full space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-black rounded">
                                    <QrCode className="h-full w-full text-white p-2" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-sm">{'{{item.name}}'}</div>
                                    <div className="text-xs text-gray-600">{'{{location.name}}'}</div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div>Kategori: {'{{item.category}}'}</div>
                                  <div>Verdi: {'{{item.value}}'}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Template Details */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <selectedTemplateData.icon className="h-4 w-4" />
                            {selectedTemplateData.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {selectedTemplateData.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Type:</span>
                              <Badge variant="secondary">{selectedTemplateData.type}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Størrelse:</span>
                              <Badge variant="outline">{selectedTemplateData.size}</Badge>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-2 text-sm">Variabler i denne malen:</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedTemplateData.variables.map((variable) => (
                                <Badge key={variable} variant="outline" className="text-xs">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="border-2 border-dashed border-gray-200 flex-1 flex items-center justify-center">
                      <CardContent className="p-8 text-center">
                        <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="font-medium mb-2">Velg en mal</h4>
                        <p className="text-sm text-muted-foreground">
                          Velg en etikettmal fra listen til venstre for å se forhåndsvisning
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Item Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Velg gjenstander som skal få etiketter. Du kan velge flere gjenstander for batch-utskrift.
              </p>

              {itemsData && itemsData.items.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedItems(itemsData.items.map(item => item.id))}
                    >
                      Velg alle
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedItems([])}
                    >
                      Fjern alle
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedItems.length} av {itemsData.items.length} gjenstander valgt
                    </span>
                  </div>

                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {itemsData.items.map((item) => (
                      <Card 
                        key={item.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedItems.includes(item.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedItems(prev => 
                            prev.includes(item.id) 
                              ? prev.filter(id => id !== item.id)
                              : [...prev, item.id]
                          )
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Package className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.description || 'Ingen beskrivelse'}
                              </p>
                              <div className="flex gap-2 mt-1">
                                {item.location && (
                                  <Badge variant="outline" className="text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {item.location.name}
                                  </Badge>
                                )}
                                {item.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.category.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {selectedItems.includes(item.id) && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ingen gjenstander funnet</h3>
                  <p className="text-muted-foreground">
                    Du må legge til gjenstander i systemet før du kan skrive ut etiketter.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Data Configuration */}
          {currentStep === 3 && selectedTemplateData && selectedItems.length > 0 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Konfigurer etikettdata for de valgte gjenstandene. Data fra systemet fylles automatisk ut.
              </p>

              <div className="space-y-4">
                {selectedItems.map((itemId) => {
                  const item = itemsData?.items.find(i => i.id === itemId)
                  if (!item) return null

                  return (
                    <Card key={itemId}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {item.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {selectedTemplateData.variables.map((variable) => {
                            // Auto-populate from item data
                            const autoValue = variable === 'item.name' ? item.name :
                                            variable === 'item.qrCode' ? `HMS-${item.id}` :
                                            variable === 'location.name' ? item.location?.name || 'Ukjent lokasjon' :
                                            variable === 'item.category' ? item.category?.name || 'Ukategorisert' :
                                            variable === 'item.value' ? item.price?.toString() || '' :
                                            labelData[`${itemId}.${variable}`] || ''

                            return (
                              <div key={variable}>
                                <Label htmlFor={`${itemId}.${variable}`}>
                                  {(variable.split('.').pop() || variable).charAt(0).toUpperCase() + (variable.split('.').pop() || variable).slice(1)}
                                </Label>
                                <Input
                                  id={`${itemId}.${variable}`}
                                  value={autoValue}
                                  onChange={(e) => setLabelData(prev => ({
                                    ...prev,
                                    [`${itemId}.${variable}`]: e.target.value
                                  }))}
                                  placeholder={`Skriv inn ${variable}`}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 4: Printer Selection */}
          {currentStep === 4 && (
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

          {/* Step 5: Preview & Print */}
          {currentStep === 5 && (
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