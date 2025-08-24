'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Printer, 
  PrinterCheck,
  Zap,
  QrCode,
  Barcode,
  Package,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  RefreshCw,
  Download,
  Eye,
  Copy
} from 'lucide-react'
import dymoService, { type LabelData, type PrintOptions } from '@/lib/printing/dymo-service'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface PrintJob {
  id: string
  type: 'qr' | 'barcode'
  data: LabelData
  status: 'pending' | 'printing' | 'completed' | 'failed'
  error?: string
}

export function DymoPrintCenter() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [printQueue, setPrintQueue] = useState<PrintJob[]>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  
  // Print settings
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    copies: 1,
    jobTitle: 'HMS Label',
    flowDirection: 'LeftToRight',
    alignment: 'Center'
  })

  // Preview state
  const [previewData, setPreviewData] = useState<LabelData | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<'qr' | 'barcode'>('qr')

  // Get items for bulk printing
  const { data: itemsData } = trpc.items.getAll.useQuery({ limit: 1000 })
  const items = itemsData?.items || []
  const { data: locations = [] } = trpc.locations.getAll.useQuery()

  useEffect(() => {
    checkServiceStatus()
  }, [])

  const checkServiceStatus = async () => {
    try {
      const status = await dymoService.getServiceStatus()
      setServiceStatus(status)
      setAvailablePrinters(status.availablePrinters)
      if (status.availablePrinters.length > 0) {
        setSelectedPrinter(status.availablePrinters[0] || '')
      }
    } catch (error) {
      console.error('Failed to check service status:', error)
    }
  }

  const initializeService = async () => {
    setIsInitializing(true)
    try {
      const success = await dymoService.initialize()
      setIsInitialized(success)
      
      if (success) {
        toast.success('DYMO service tilkoblet!')
        await checkServiceStatus()
      } else {
        toast.error('Kunne ikke koble til DYMO service')
      }
    } catch (error) {
      toast.error('DYMO initialisering feilet')
      console.error('DYMO initialization failed:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  const addToQueue = (labelData: LabelData, type: 'qr' | 'barcode') => {
    const job: PrintJob = {
      id: Date.now().toString(),
      type,
      data: labelData,
      status: 'pending'
    }
    
    setPrintQueue(prev => [...prev, job])
    toast.info(`${type === 'qr' ? 'QR' : 'Strekkode'} etikett lagt til i køen`)
  }

  const processQueue = async () => {
    if (printQueue.length === 0 || isProcessingQueue) return

    setIsProcessingQueue(true)
    
    for (const job of printQueue) {
      if (job.status !== 'pending') continue

      setPrintQueue(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'printing' } : j
      ))

      try {
        if (job.type === 'qr') {
          await dymoService.printQRLabel({
            qrCode: job.data.qrCode || '',
            itemName: job.data.itemName || '',
            locationName: job.data.locationName || '',
            categoryName: job.data.categoryName || ''
          }, { 
            ...printOptions, 
            printerName: selectedPrinter 
          })
        } else {
          await dymoService.printBarcodeLabel({
            barcode: job.data.barcode || '',
            itemName: job.data.itemName || '',
            locationName: job.data.locationName || ''
          }, { 
            ...printOptions, 
            printerName: selectedPrinter 
          })
        }

        setPrintQueue(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'completed' } : j
        ))

        toast.success(`Etikett for ${job.data.itemName} skrevet ut`)
      } catch (error) {
        setPrintQueue(prev => prev.map(j => 
          j.id === job.id ? { 
            ...j, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error'
          } : j
        ))

        toast.error(`Feil ved utskrift av ${job.data.itemName}`)
      }

      // Small delay between prints
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsProcessingQueue(false)
    toast.success('Alle etiketter er behandlet')
  }

  const clearQueue = () => {
    setPrintQueue([])
    toast.info('Køen er tømt')
  }

  const removeFromQueue = (jobId: string) => {
    setPrintQueue(prev => prev.filter(job => job.id !== jobId))
  }

  const generatePreview = async () => {
    if (!previewData) return

    try {
      const base64Image = await dymoService.previewLabel(previewData, previewType)
      setPreviewImage(base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`)
      toast.success('Forhåndsvisning generert')
    } catch (error) {
      toast.error('Kunne ikke generere forhåndsvisning')
      console.error('Preview generation failed:', error)
    }
  }

  const getStatusIcon = (job: PrintJob) => {
    switch (job.status) {
      case 'pending': return <QrCode className="w-4 h-4 text-gray-500" />
      case 'printing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            DYMO Label Printer
          </CardTitle>
          <CardDescription>
            Professional label printing for QR codes and barcodes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              {serviceStatus?.isFrameworkInstalled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm">
                Framework: {serviceStatus?.isFrameworkInstalled ? 'Installert' : 'Ikke installert'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {serviceStatus?.isWebServicePresent ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm">
                Web Service: {serviceStatus?.isWebServicePresent ? 'Kjører' : 'Ikke tilgjengelig'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <PrinterCheck className="w-5 h-5 text-blue-500" />
              <span className="text-sm">
                Skrivere: {availablePrinters.length}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={initializeService}
              disabled={isInitializing}
              variant={isInitialized ? "outline" : "default"}
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kobler til...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {isInitialized ? 'Koble til på nytt' : 'Koble til DYMO'}
                </>
              )}
            </Button>

            <Button variant="outline" onClick={checkServiceStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Oppdater status
            </Button>
          </div>

          {!serviceStatus?.isFrameworkInstalled && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                DYMO Label Framework er ikke installert. Last ned fra{' '}
                <a 
                  href="https://www.dymo.com/en-US/online-support/dymo-user-guides/dymo-connect/dymo-connect-sdk-for-developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  DYMO.com
                </a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isInitialized && (
        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="single">Enkelt etikett</TabsTrigger>
            <TabsTrigger value="bulk">Bulk utskrift</TabsTrigger>
            <TabsTrigger value="preview">Forhåndsvisning</TabsTrigger>
            <TabsTrigger value="queue">Utskriftskø</TabsTrigger>
          </TabsList>

          {/* Single Label Tab */}
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Skriv ut enkelt etikett</CardTitle>
                <CardDescription>
                  Opprett og skriv ut QR eller strekkode etiketter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item-name">Gjenstand navn</Label>
                    <Input
                      id="item-name"
                      placeholder="Navn på gjenstanden"
                      value={previewData?.itemName || ''}
                      onChange={(e) => setPreviewData(prev => ({ 
                        ...(prev || {} as any), 
                        itemName: e.target.value,
                        qrCode: `item:${e.target.value}`,
                        locationName: (prev?.locationName || '') as string,
                        barcode: (prev?.barcode || '') as string
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location-name">Lokasjon</Label>
                    <Select 
                      value={previewData?.locationName || ''} 
                      onValueChange={(value) => setPreviewData(prev => ({ 
                        ...(prev || {} as any), 
                        locationName: value,
                        itemName: (prev?.itemName || '') as string,
                        qrCode: `item:${prev?.itemName || ''}`,
                        barcode: (prev?.barcode || '') as string
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg lokasjon" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="barcode">Strekkode (valgfritt)</Label>
                    <Input
                      id="barcode"
                      placeholder="f.eks. 1234567890123"
                      value={previewData?.barcode || ''}
                      onChange={(e) => setPreviewData(prev => ({ 
                        ...(prev || {} as any), 
                        barcode: e.target.value,
                        itemName: (prev?.itemName || '') as string,
                        locationName: (prev?.locationName || '') as string,
                        qrCode: `item:${prev?.itemName || ''}`
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="printer">Skriver</Label>
                    <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg skriver" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePrinters.map(printer => (
                          <SelectItem key={printer} value={printer}>
                            {printer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="copies">Antall kopier</Label>
                    <Input
                      id="copies"
                      type="number"
                      min="1"
                      max="10"
                      value={printOptions.copies || 1}
                      onChange={(e) => setPrintOptions(prev => ({ 
                        ...prev, 
                        copies: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="label-type">Etikett type</Label>
                    <Select 
                      value={previewType} 
                      onValueChange={(value: 'qr' | 'barcode') => setPreviewType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qr">QR kode</SelectItem>
                        <SelectItem value="barcode">Strekkode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => previewData && addToQueue(previewData, previewType)}
                    disabled={!previewData?.itemName || !previewData?.locationName || !selectedPrinter}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Legg til i kø
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={generatePreview}
                    disabled={!previewData?.itemName}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Forhåndsvisning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Printing Tab */}
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk utskrift</CardTitle>
                <CardDescription>
                  Skriv ut etiketter for flere gjenstander samtidig
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Velg gjenstander</Label>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {items.slice(0, 10).map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-2 py-1">
                            <Checkbox 
                              id={`item-${item.id}`}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const labelData: LabelData = {
                                    itemName: item.name,
                                    locationName: item.location?.name || 'Ukjent',
                                    qrCode: `item:${item.id}`,
                                    categoryName: item.category?.name || '',
                                    barcode: item.barcode || '',
                                    householdName: 'Min husholdning'
                                  }
                                  addToQueue(labelData, item.barcode ? 'barcode' : 'qr')
                                }
                              }}
                            />
                            <Label htmlFor={`item-${item.id}`} className="text-sm flex-1">
                              {item.name} - {item.location?.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Utskriftsinnstillinger</Label>
                      <div className="space-y-3 mt-2">
                        <div>
                          <Label htmlFor="bulk-printer">Skriver</Label>
                          <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Velg skriver" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePrinters.map(printer => (
                                <SelectItem key={printer} value={printer}>
                                  {printer}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="bulk-copies">Kopier per etikett</Label>
                          <Input
                            id="bulk-copies"
                            type="number"
                            min="1"
                            max="5"
                            value={printOptions.copies || 1}
                            onChange={(e) => setPrintOptions(prev => ({ 
                              ...prev, 
                              copies: parseInt(e.target.value) || 1 
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Gjenstander med strekkode får strekkode-etiketter, andre får QR-etiketter.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Etikett forhåndsvisning</CardTitle>
                <CardDescription>
                  Se hvordan etiketten vil se ut før utskrift
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewImage ? (
                  <div className="text-center">
                    <img 
                      src={previewImage} 
                      alt="Label preview" 
                      className="mx-auto border rounded-lg shadow-lg max-w-md"
                    />
                    <div className="mt-4 flex justify-center gap-2">
                      <Button variant="outline" onClick={() => setPreviewImage(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Ny forhåndsvisning
                      </Button>
                      <Button onClick={() => {
                        if (previewData) addToQueue(previewData, previewType)
                      }}>
                        <Package className="w-4 h-4 mr-2" />
                        Legg til i kø
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Ingen forhåndsvisning generert ennå</p>
                    <p className="text-sm">Fyll ut skjemaet og klikk "Forhåndsvisning"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Print Queue Tab */}
          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Utskriftskø</CardTitle>
                    <CardDescription>
                      {printQueue.length} etiketter i køen
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={processQueue}
                      disabled={printQueue.length === 0 || isProcessingQueue}
                    >
                      {isProcessingQueue ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Skriver ut...
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4 mr-2" />
                          Skriv ut alle
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={clearQueue}>
                      Tøm kø
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {printQueue.length > 0 ? (
                  <div className="space-y-2">
                    {printQueue.map(job => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(job)}
                          <div>
                            <p className="font-medium">{job.data.itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.type === 'qr' ? 'QR kode' : 'Strekkode'} - {job.data.locationName}
                            </p>
                            {job.error && (
                              <p className="text-sm text-red-600">{job.error}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'failed' ? 'destructive' :
                            job.status === 'printing' ? 'secondary' : 'outline'
                          }>
                            {job.status === 'pending' && 'Venter'}
                            {job.status === 'printing' && 'Skriver ut'}
                            {job.status === 'completed' && 'Fullført'}
                            {job.status === 'failed' && 'Feilet'}
                          </Badge>
                          
                          {job.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFromQueue(job.id)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Printer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Køen er tom</p>
                    <p className="text-sm">Legg til etiketter for utskrift</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
