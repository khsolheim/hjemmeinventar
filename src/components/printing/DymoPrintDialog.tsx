'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Printer, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { dymoService, type LabelData, type PrintOptions } from '@/lib/printing/dymo-service'

// Compatible Location interface based on Prisma model
interface Location {
  id: string
  name: string
  description?: string | null
  type: string
  qrCode: string
  parentId?: string | null
}

interface DymoPrintDialogProps {
  locations: Location[]
  isOpen: boolean
  onClose: () => void
}

export function DymoPrintDialog({ 
  locations, 
  isOpen, 
  onClose 
}: DymoPrintDialogProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [labelSize, setLabelSize] = useState<'small' | 'standard' | 'large'>('standard')
  const [copies, setCopies] = useState(1)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [printers, setPrinters] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  
  // Use the singleton dymoService instance
  
  // Load printers when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadPrinters()
    } else {
      // Reset state when dialog closes
      setPreviewImage(null)
      setSelectedPrinter('')
    }
  }, [isOpen])
  
  // Generate preview when settings change
  useEffect(() => {
    if (selectedPrinter && locations.length === 1) {
      generatePreview()
    }
  }, [selectedPrinter, labelSize, locations])
  
  const loadPrinters = async () => {
    setIsLoadingPrinters(true)
    try {
      await dymoService.initialize()
      setIsConnected(true) // Mock for now
      
      if (true) { // Mock connection check
        const availablePrinters = ['Default Printer'] // Mock printers
        setPrinters(availablePrinters)
        
        if (availablePrinters.length > 0) {
          setSelectedPrinter(availablePrinters[0])
        }
        
        toast.success('Koblet til Dymo Connect')
      } else {
        toast.error('Dymo Connect er ikke tilgjengelig')
      }
    } catch (error) {
      console.error('Dymo connection error:', error)
      setIsConnected(false)
      toast.error('Kunne ikke koble til Dymo Connect. Sjekk at programmet kjører.')
    } finally {
      setIsLoadingPrinters(false)
    }
  }
  
  const generatePreview = async () => {
    if (!selectedPrinter || locations.length !== 1) return
    
    setIsGeneratingPreview(true)
    try {
      const options: PrintOptions = {
        printerName: selectedPrinter,
        labelSize,
        copies
      }
      
      // Convert Location to LabelData
      const labelData: LabelData = {
        itemName: locations[0].name,
        locationName: locations[0].name,
        qrCode: locations[0].qrCode,
        categoryName: locations[0].type,
        dateAdded: new Date().toLocaleDateString('no-NO')
      }
      
      const preview = await dymoService.previewLabel(labelData, 'qr')
      setPreviewImage(preview)
    } catch (error) {
      console.error('Preview generation error:', error)
      toast.error('Kunne ikke generere forhåndsvisning')
      setPreviewImage(null)
    } finally {
      setIsGeneratingPreview(false)
    }
  }
  
  const handlePrint = async () => {
    if (!selectedPrinter) {
      toast.error('Velg en skriver først')
      return
    }
    
    if (!isConnected) {
      toast.error('Ikke koblet til Dymo Connect')
      return
    }
    
    setIsPrinting(true)
    
    try {
      const options: PrintOptions = {
        printerName: selectedPrinter,
        labelSize,
        copies
      }
      
      if (locations.length === 1) {
        // Convert Location to LabelData
        const labelData: LabelData = {
          itemName: locations[0].name,
          locationName: locations[0].name,
          qrCode: locations[0].qrCode,
          categoryName: locations[0].type,
          dateAdded: new Date().toLocaleDateString('no-NO')
        }
        await dymoService.printLocationLabel(labelData, options)
        toast.success('Etikett skrevet ut!')
      } else {
        // Convert multiple Locations to LabelData
        const labelsData: LabelData[] = locations.map(location => ({
          itemName: location.name,
          locationName: location.name,
          qrCode: location.qrCode,
          categoryName: location.type,
          dateAdded: new Date().toLocaleDateString('no-NO')
        }))
        await dymoService.printMultipleLabels(labelsData, options)
        toast.success(`${locations.length} etiketter skrevet ut!`)
      }
      
      onClose()
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Utskrift feilet. Sjekk skriver og forbindelse.')
    } finally {
      setIsPrinting(false)
    }
  }
  
  const downloadPreview = () => {
    if (!previewImage) return
    
    const link = document.createElement('a')
    link.href = previewImage
    link.download = `label-preview-${locations[0]?.name || 'unknown'}.png`
    link.click()
  }
  
  const getLabelSizeInfo = (size: 'small' | 'standard' | 'large') => {
    const info = {
      small: { name: 'Liten', description: '30334 Multi-purpose', size: '1" x 2.125"' },
      standard: { name: 'Standard', description: '30252 Address', size: '1.125" x 3.5"' },
      large: { name: 'Stor', description: '30323 Shipping', size: '2.125" x 4"' }
    }
    return info[size]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Skriv ut etiketter
          </DialogTitle>
          <DialogDescription>
            {locations.length === 1 
              ? `Skriv ut etikett for "${locations[0].name}"`
              : `Skriv ut ${locations.length} etiketter`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Dymo Connect Status
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPrinters}
                  disabled={isLoadingPrinters}
                >
                  {isLoadingPrinters ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Tilkoblet</span>
                    <Badge variant="secondary">{printers.length} skrivere</Badge>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      Ikke tilkoblet - Start Dymo Connect
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Print Settings */}
          {isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Printer Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Skriverinnstillinger
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="printer-select">Skriver</Label>
                    <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg skriver" />
                      </SelectTrigger>
                      <SelectContent>
                        {printers.map((printer) => (
                          <SelectItem key={printer} value={printer}>
                            {printer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="label-size">Etikett-størrelse</Label>
                    <Select value={labelSize} onValueChange={(value: 'small' | 'standard' | 'large') => setLabelSize(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['small', 'standard', 'large'] as const).map((size) => {
                          const info = getLabelSizeInfo(size)
                          return (
                            <SelectItem key={size} value={size}>
                              <div className="flex flex-col">
                                <span>{info.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {info.description} ({info.size})
                                </span>
                              </div>
                            </SelectItem>
                          )
                        })}
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
                      value={copies}
                      onChange={(e) => setCopies(parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {locations.length === 1 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Forhåndsvisning
                      </CardTitle>
                      {previewImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadPreview}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      {isGeneratingPreview ? (
                        <div className="flex items-center justify-center w-32 h-24 bg-muted rounded border">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : previewImage ? (
                        <img
                          src={previewImage}
                          alt="Label Preview"
                          className="max-w-full h-auto border rounded"
                          style={{ maxHeight: '200px' }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-32 h-24 bg-muted rounded border">
                          <Eye className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Location List for multiple items */}
          {locations.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Lokasjoner som skal skrives ut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {location.type}
                          {location.parentId && ` (Parent ID: ${location.parentId})`}
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        {location.qrCode}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {!isConnected && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-orange-800">
                  Slik kommer du i gang:
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-orange-700 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Last ned og installer Dymo Connect fra dymo.com</li>
                  <li>Start Dymo Connect programmet</li>
                  <li>Koble til Dymo LabelWriter skriveren</li>
                  <li>Klikk "Oppdater" for å koble til</li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!isConnected || !selectedPrinter || isPrinting}
          >
            {isPrinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Skriver ut...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Skriv ut {locations.length > 1 ? `${locations.length} etiketter` : 'etikett'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
