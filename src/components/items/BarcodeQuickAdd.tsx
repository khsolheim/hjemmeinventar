'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Sparkles,
  Check,
  RotateCcw,
  Loader2,
  Search
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface BarcodeQuickAddProps {
  onComplete: () => void
  onProcessingChange: (processing: boolean) => void
}

export function BarcodeQuickAdd({ onComplete, onProcessingChange }: BarcodeQuickAddProps) {
  const [scannedCode, setScannedCode] = useState<string>('')
  const [productInfo, setProductInfo] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: '',
    description: ''
  })

  const searchProductMutation = trpc.items.searchProduct.useMutation()
  const createItemMutation = trpc.items.create.useMutation()

  const handleScan = async (code: string) => {
    setScannedCode(code)
    setIsSearching(true)
    onProcessingChange(true)

    try {
      // Search for product information
      const product = await searchProductMutation.mutateAsync({ code })
      setProductInfo(product)
      
      // Auto-fill form with product information
      setFormData({
        name: product.name || '',
        location: product.suggestedLocation || '',
        category: product.category || '',
        description: product.description || ''
      })
    } catch (error) {
      console.error('Product search failed:', error)
      // Fallback to manual input
      setFormData({
        name: '',
        location: '',
        category: '',
        description: ''
      })
    } finally {
      setIsSearching(false)
      onProcessingChange(false)
    }
  }

  const handleManualCode = async () => {
    if (!scannedCode.trim()) return
    await handleScan(scannedCode)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    onProcessingChange(true)

    try {
      await createItemMutation.mutateAsync({
        name: formData.name,
        locationId: formData.location,
        category: formData.category,
        description: formData.description,
        barcode: scannedCode
      })

      onComplete()
    } catch (error) {
      console.error('Failed to create item:', error)
    } finally {
      onProcessingChange(false)
    }
  }

  const handleRetry = () => {
    setScannedCode('')
    setProductInfo(null)
    setFormData({
      name: '',
      location: '',
      category: '',
      description: ''
    })
  }

  return (
    <div className="space-y-4">
      {/* Scan Interface */}
      {!scannedCode && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Skann QR-kode eller strekkode</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Hold kameraet mot koden for å få produktinformasjon
            </p>
          </div>

          <Button
            onClick={() => {
              // In a real implementation, this would open the camera scanner
              // For now, we'll simulate with a manual input
              const code = prompt('Skriv inn QR-kode eller strekkode:')
              if (code) {
                handleScan(code)
              }
            }}
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Start skanning
          </Button>

          <div className="text-xs text-muted-foreground bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" />
              <span className="font-medium">Skanningshjelp:</span>
            </div>
            <ul className="space-y-1">
              <li>• Hold kameraet stødig mot koden</li>
              <li>• Sørg for god belysning</li>
              <li>• Produktinformasjon hentes automatisk</li>
            </ul>
          </div>
        </div>
      )}

      {/* Scanned Code Display */}
      {scannedCode && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800">Skannet kode:</span>
            <Badge variant="outline" className="bg-white">
              {scannedCode}
            </Badge>
          </div>
          
          {!productInfo && !isSearching && (
            <div className="flex gap-2">
              <Input
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Skriv inn kode manuelt"
                className="flex-1"
              />
              <Button onClick={handleManualCode} size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Product Information */}
      {productInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-medium text-green-800">Produkt funnet</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Produktnavn:</span>
              <Badge variant="outline" className="bg-white">
                {productInfo.name}
              </Badge>
            </div>
            {productInfo.brand && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Merke:</span>
                <Badge variant="outline" className="bg-white">
                  {productInfo.brand}
                </Badge>
              </div>
            )}
            {productInfo.category && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Kategori:</span>
                <Badge variant="outline" className="bg-white">
                  {productInfo.category}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing State */}
      {isSearching && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="font-medium text-blue-800">Søker etter produkt...</p>
              <p className="text-sm text-blue-600">Henter produktinformasjon</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Navn *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Lokasjon</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1"
            placeholder="F.eks. 'Kjøkken' eller 'Stue'"
          />
        </div>

        <div>
          <Label htmlFor="category">Kategori</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="mt-1"
            placeholder="F.eks. 'Kjøkkenutstyr' eller 'Elektronikk'"
          />
        </div>

        <div>
          <Label htmlFor="description">Beskrivelse</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1"
            placeholder="Legg til mer informasjon"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleRetry}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Prøv igjen
          </Button>
          
          <Button
            type="submit"
            className="flex-1"
            disabled={!formData.name.trim() || createItemMutation.isLoading}
          >
            {createItemMutation.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Lagrer...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Lagre gjenstand
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
