'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  RefreshCw,
  QrCode,
  Home,
  Package,
  Archive,
  Folder,
  ShoppingBag,
  FileText,
  BookOpen,
  Square
} from 'lucide-react'
import { toast } from 'sonner'
import { WizardLocation } from './LocationWizardProvider'
import { LocationType } from '@prisma/client'

interface LocationPrintDialogProps {
  locations: WizardLocation[]
  isOpen: boolean
  onClose: () => void
}

const locationTypeIcons = {
  [LocationType.ROOM]: Home,
  [LocationType.CABINET]: Package,
  [LocationType.RACK]: BookOpen,
  [LocationType.WALL_SHELF]: Square,
  [LocationType.SHELF]: Folder,
  [LocationType.DRAWER]: FileText,
  [LocationType.BOX]: Archive,
  [LocationType.BAG]: ShoppingBag,
  [LocationType.CONTAINER]: Package,
  [LocationType.SHELF_COMPARTMENT]: Folder,
  [LocationType.SECTION]: Square
}

const locationTypeLabels = {
  [LocationType.ROOM]: 'Rom',
  [LocationType.CABINET]: 'Skap',
  [LocationType.RACK]: 'Reol',
  [LocationType.WALL_SHELF]: 'Vegghengt hylle',
  [LocationType.SHELF]: 'Hylle',
  [LocationType.DRAWER]: 'Skuff',
  [LocationType.BOX]: 'Boks',
  [LocationType.BAG]: 'Pose',
  [LocationType.CONTAINER]: 'Beholder',
  [LocationType.SHELF_COMPARTMENT]: 'Hylle',
  [LocationType.SECTION]: 'Avsnitt'
}

export function LocationPrintDialog({ 
  locations, 
  isOpen, 
  onClose 
}: LocationPrintDialogProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [labelSize, setLabelSize] = useState<'small' | 'standard' | 'large'>('standard')
  const [copies, setCopies] = useState(1)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [printers, setPrinters] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  
  // Print options specific to locations
  const [includeHierarchy, setIncludeHierarchy] = useState(true)
  const [includeQRCode, setIncludeQRCode] = useState(true)
  const [includeAutoNumber, setIncludeAutoNumber] = useState(true)
  const [includeColorCode, setIncludeColorCode] = useState(true)
  const [includeTags, setIncludeTags] = useState(false)

  // Mock printer loading (replace with actual DYMO integration)
  const loadPrinters = async () => {
    setIsLoadingPrinters(true)
    try {
      // Simulate loading printers
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPrinters(['DYMO LabelWriter 450', 'DYMO LabelWriter 4XL'])
      setIsConnected(true)
      if (!selectedPrinter) {
        setSelectedPrinter('DYMO LabelWriter 450')
      }
    } catch (error) {
      console.error('Error loading printers:', error)
      toast.error('Kunne ikke koble til DYMO Connect')
      setIsConnected(false)
    } finally {
      setIsLoadingPrinters(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadPrinters()
    } else {
      setPreviewImage(null)
      setSelectedPrinter('')
    }
  }, [isOpen])

  const generatePreview = async () => {
    if (!selectedPrinter || locations.length === 0) return
    
    setIsGeneratingPreview(true)
    try {
      // Simulate preview generation
      await new Promise(resolve => setTimeout(resolve, 500))
      setPreviewImage('/api/placeholder/300/200') // Placeholder
    } catch (error) {
      console.error('Preview generation error:', error)
      toast.error('Kunne ikke generere forhåndsvisning')
      setPreviewImage(null)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  useEffect(() => {
    if (selectedPrinter && locations.length > 0) {
      generatePreview()
    }
  }, [selectedPrinter, labelSize, locations, includeHierarchy, includeQRCode, includeAutoNumber])

  const handlePrint = async () => {
    if (!selectedPrinter) {
      toast.error('Velg en skriver først')
      return
    }
    
    if (!isConnected) {
      toast.error('Ikke koblet til DYMO Connect')
      return
    }
    
    setIsPrinting(true)
    
    try {
      // Simulate printing
      for (const location of locations) {
        console.log('Printing location:', {
          name: location.displayName || location.name,
          type: location.type,
          autoNumber: location.autoNumber,
          qrCode: location.qrCode,
          includeHierarchy,
          includeQRCode,
          includeAutoNumber,
          includeColorCode,
          includeTags
        })
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (locations.length === 1) {
        toast.success('Etikett skrevet ut!')
      } else {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Skriv ut lokasjonsetiketter
          </DialogTitle>
          <DialogDescription>
            Skriv ut QR-kode etiketter for {locations.length} lokasjon{locations.length !== 1 ? 'er' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Printer Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>DYMO Skriver</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPrinters}
                disabled={isLoadingPrinters}
              >
                {isLoadingPrinters ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Oppdater
              </Button>
            </div>
            
            <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Velg DYMO skriver" />
              </SelectTrigger>
              <SelectContent>
                {printers.map((printer) => (
                  <SelectItem key={printer} value={printer}>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                      {printer}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Print Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Etikett størrelse</Label>
              <Select value={labelSize} onValueChange={(value: any) => setLabelSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Liten (30334)</SelectItem>
                  <SelectItem value="standard">Standard (30252)</SelectItem>
                  <SelectItem value="large">Stor (30323)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Antall kopier</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-center justify-center">
              {isGeneratingPreview ? (
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              ) : (
                <Button variant="outline" onClick={generatePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Forhåndsvis
                </Button>
              )}
            </div>
          </div>

          {/* Print Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Etikett innhold</CardTitle>
              <CardDescription>Velg hva som skal inkluderes på etikettene</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-qr">QR-kode</Label>
                  <Switch
                    id="include-qr"
                    checked={includeQRCode}
                    onCheckedChange={setIncludeQRCode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-hierarchy">Hierarki info</Label>
                  <Switch
                    id="include-hierarchy"
                    checked={includeHierarchy}
                    onCheckedChange={setIncludeHierarchy}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-auto-number">Automatisk nummer</Label>
                  <Switch
                    id="include-auto-number"
                    checked={includeAutoNumber}
                    onCheckedChange={setIncludeAutoNumber}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-color">Fargekoding</Label>
                  <Switch
                    id="include-color"
                    checked={includeColorCode}
                    onCheckedChange={setIncludeColorCode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-tags">Tags/etiketter</Label>
                  <Switch
                    id="include-tags"
                    checked={includeTags}
                    onCheckedChange={setIncludeTags}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {previewImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Forhåndsvisning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="bg-white border rounded p-4">
                    <div className="text-center space-y-2">
                      <div className="w-48 h-32 bg-gray-100 border rounded flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500">QR-kode forhåndsvisning</p>
                        </div>
                      </div>
                      {locations.length === 1 && (
                        <div className="text-sm">
                          <div className="font-medium">{locations[0]?.displayName || locations[0]?.name}</div>
                          {includeAutoNumber && locations[0]?.autoNumber && (
                            <div className="text-gray-500">{locations[0]?.autoNumber}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lokasjoner ({locations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {locations.map((location) => {
                  const Icon = locationTypeIcons[location.type]
                  return (
                    <div key={location.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${location.colorCode ? 'text-current' : 'text-gray-500'}`}
                              style={location.colorCode ? { color: location.colorCode } : {}} />
                        <div>
                          <div className="font-medium">{location.displayName || location.name}</div>
                          <div className="text-xs text-gray-500">
                            {locationTypeLabels[location.type]}
                            {location.autoNumber && ` • ${location.autoNumber}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {location.isPrivate && (
                          <Badge variant="destructive" className="text-xs">Privat</Badge>
                        )}
                        <Badge variant="outline" className="font-mono text-xs">
                          {location.qrCode?.slice(-6) || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          {!isConnected && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  DYMO Connect ikke tilkoblet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-orange-700 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Last ned og installer DYMO Connect fra dymo.com</li>
                  <li>Start DYMO Connect programmet</li>
                  <li>Koble til DYMO LabelWriter skriveren</li>
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
            disabled={!selectedPrinter || !isConnected || isPrinting || locations.length === 0}
          >
            {isPrinting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Skriver ut...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Skriv ut {locations.length > 1 ? `(${locations.length})` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}