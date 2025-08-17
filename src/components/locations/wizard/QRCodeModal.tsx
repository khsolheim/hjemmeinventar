'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Share2,
  QrCode,
  MapPin,
  Home,
  Package,
  Archive,
  Folder,
  ShoppingBag,
  FileText,
  BookOpen,
  Square
} from 'lucide-react'
import { WizardLocation } from './LocationWizardProvider'
import { LocationType } from '@prisma/client'
import QRCode from 'qrcode'
import { toast } from 'sonner'

interface QRCodeModalProps {
  location: WizardLocation
  isOpen: boolean
  onClose: () => void
  onPrint?: (location: WizardLocation) => void
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

export function QRCodeModal({ location, isOpen, onClose, onPrint }: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const Icon = locationTypeIcons[location.type]
  const typeLabel = locationTypeLabels[location.type]

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && location.qrCode) {
      generateQRCode()
    }
  }, [isOpen, location.qrCode])

  const generateQRCode = async () => {
    if (!location.qrCode) return
    
    setIsGenerating(true)
    try {
      // Create QR code with location data
      const qrData = JSON.stringify({
        id: location.id,
        name: location.displayName || location.name,
        type: location.type,
        qrCode: location.qrCode,
        autoNumber: location.autoNumber,
        level: location.level
      })

      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      setQrCodeDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Kunne ikke generere QR-kode')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyQRCode = async () => {
    try {
      await navigator.clipboard.writeText(location.qrCode || '')
      toast.success('QR-kode kopiert til utklippstavle')
    } catch (error) {
      toast.error('Kunne ikke kopiere QR-kode')
    }
  }

  const handleDownloadQRCode = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = `qr-${location.name.replace(/\s+/g, '-').toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR-kode lastet ned')
  }

  const handlePrintQRCode = () => {
    if (onPrint) {
      onPrint(location)
    } else {
      // Fallback: open print dialog with QR code
      if (qrCodeDataUrl) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>QR-kode: ${location.displayName || location.name}</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 20px; 
                  }
                  .location-info {
                    margin-bottom: 20px;
                  }
                  .qr-code {
                    margin: 20px 0;
                  }
                  .details {
                    font-size: 12px;
                    color: #666;
                    margin-top: 10px;
                  }
                </style>
              </head>
              <body>
                <div class="location-info">
                  <h2>${location.displayName || location.name}</h2>
                  <p>${typeLabel}${location.autoNumber ? ` (${location.autoNumber})` : ''}</p>
                </div>
                <div class="qr-code">
                  <img src="${qrCodeDataUrl}" alt="QR-kode" />
                </div>
                <div class="details">
                  <p>QR-kode: ${location.qrCode}</p>
                  <p>Opprettet: ${new Date().toLocaleDateString('nb-NO')}</p>
                </div>
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()
        }
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share && qrCodeDataUrl) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCodeDataUrl)
        const blob = await response.blob()
        const file = new File([blob], `qr-${location.name}.png`, { type: 'image/png' })

        await navigator.share({
          title: `QR-kode: ${location.displayName || location.name}`,
          text: `QR-kode for ${typeLabel} "${location.displayName || location.name}"`,
          files: [file]
        })
      } catch (error) {
        // Fallback to copying QR code text
        handleCopyQRCode()
      }
    } else {
      handleCopyQRCode()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-blue-600" />
              QR-kode
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Location Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon className={`h-6 w-6 ${location.colorCode ? 'text-current' : 'text-gray-600'}`}
                    style={location.colorCode ? { color: location.colorCode } : {}} />
              <h3 className="text-lg font-semibold">
                {location.displayName || location.name}
              </h3>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>{typeLabel}</span>
              {location.autoNumber && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {location.autoNumber}
                  </Badge>
                </>
              )}
              {location.isPrivate && (
                <>
                  <span>•</span>
                  <Badge variant="destructive" className="text-xs">
                    Privat
                  </Badge>
                </>
              )}
            </div>

            {location.tags && location.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {location.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* QR Code Display */}
          <div className="text-center">
            {isGenerating ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR-kode"
                  className="w-64 h-64"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Kunne ikke laste QR-kode</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateQRCode}
                    className="mt-2"
                  >
                    Prøv igjen
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Info */}
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>QR-kode: <code className="bg-gray-100 px-1 rounded text-xs">{location.qrCode}</code></p>
            <p>Skann med mobilen for å se lokasjon</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleCopyQRCode}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Kopier
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadQRCode}
              disabled={!qrCodeDataUrl}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Last ned
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintQRCode}
              disabled={!qrCodeDataUrl}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Skriv ut
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={!qrCodeDataUrl}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Del
            </Button>
          </div>

          {/* Advanced Printing */}
          {onPrint && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => onPrint(location)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                Profesjonell utskrift
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Bruk DYMO skriver for etiketter
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}