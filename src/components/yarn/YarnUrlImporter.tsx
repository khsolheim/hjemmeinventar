'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  Globe, 
  Download, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Package,
  Tag,
  DollarSign,
  Ruler,
  Palette
} from 'lucide-react'
import { toast } from 'sonner'
import type { YarnProductData } from '@/lib/scraping/yarn-url-scraper'
import type { ImageUploadResult } from '@/lib/image/image-service'

interface YarnUrlImporterProps {
  onImport: (productData: YarnProductData & { downloadedImages?: ImageUploadResult[] }) => void
  disabled?: boolean
}

export function YarnUrlImporter({ onImport, disabled }: YarnUrlImporterProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [scrapedData, setScrapedData] = useState<YarnProductData | null>(null)
  const [downloadedImages, setDownloadedImages] = useState<ImageUploadResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScrapeUrl = async () => {
    if (!url.trim()) {
      toast.error('Vennligst skriv inn en URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setScrapedData(null)
    setDownloadedImages(null)

    try {
      const response = await fetch('/api/scrape-yarn-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(),
          downloadImages: true
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Kunne ikke hente produktinformasjon')
      }

      setScrapedData(result.data)
      setDownloadedImages(result.data.downloadedImages || null)
      
      const imageCount = result.data.downloadedImages?.length || 0
      if (imageCount > 0) {
        toast.success(`Produktinformasjon og ${imageCount} bilder hentet!`)
      } else {
        toast.success('Produktinformasjon hentet!')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ukjent feil'
      setError(errorMessage)
      toast.error(`Feil ved henting: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = () => {
    if (scrapedData) {
      onImport({
        ...scrapedData,
        downloadedImages: downloadedImages || undefined
      })
      // Reset state
      setUrl('')
      setScrapedData(null)
      setDownloadedImages(null)
      setError(null)
    }
  }

  const getSupportedSites = () => [
    { name: 'Adlibris', url: 'adlibris.com' },
    { name: 'Hobbii', url: 'hobbii.com' },
    { name: 'Garnstudio/Drops', url: 'garnstudio.com' },
    { name: 'Andre nettsider', url: 'Generisk support' }
  ]

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Importer fra URL
          </CardTitle>
          <CardDescription>
            Lim inn link til et garnprodukt for automatisk import av produktinformasjon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="yarn-url">Produkt URL</Label>
              <Input
                id="yarn-url"
                type="url"
                placeholder="https://www.adlibris.com/no/bok/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={disabled || isLoading}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleScrapeUrl} 
                disabled={disabled || isLoading || !url.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Henter...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Hent info
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Supported sites */}
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Støttede nettsider:</p>
            <div className="flex flex-wrap gap-1">
              {getSupportedSites().map((site, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {site.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Scraped Data Preview */}
      {scrapedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Produktinformasjon funnet
              </div>
              <Badge variant="secondary" className="text-xs">
                {scrapedData.source.siteName}
              </Badge>
            </CardTitle>
            <CardDescription>
              Sjekk informasjonen før import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Produktnavn */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1">
                <Package className="h-4 w-4" />
                Produktnavn
              </Label>
              <p className="mt-1 text-lg font-semibold">{scrapedData.name}</p>
            </div>

            {/* Grunnleggende info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scrapedData.producer && (
                <div>
                  <Label className="text-sm font-medium">Produsent</Label>
                  <p className="mt-1">{scrapedData.producer}</p>
                </div>
              )}

              {scrapedData.price && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Pris
                  </Label>
                  <p className="mt-1 font-semibold">{scrapedData.price} kr</p>
                </div>
              )}

              {scrapedData.weight && (
                <div>
                  <Label className="text-sm font-medium">Vekt</Label>
                  <p className="mt-1">{scrapedData.weight}</p>
                </div>
              )}

              {scrapedData.yardage && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    Løpelengde
                  </Label>
                  <p className="mt-1">{scrapedData.yardage}</p>
                </div>
              )}

              {scrapedData.needleSize && (
                <div>
                  <Label className="text-sm font-medium">Pinnestørrelse</Label>
                  <p className="mt-1">{scrapedData.needleSize}</p>
                </div>
              )}

              {scrapedData.composition && (
                <div>
                  <Label className="text-sm font-medium">Sammensetning</Label>
                  <p className="mt-1">{scrapedData.composition}</p>
                </div>
              )}
            </div>

            {/* Farger */}
            {scrapedData.colors && scrapedData.colors.length > 0 && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Palette className="h-4 w-4" />
                  Tilgjengelige farger
                </Label>
                <div className="flex flex-wrap gap-1">
                  {scrapedData.colors.map((color, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {color.name}
                      {color.colorCode && (
                        <span className="ml-1 text-muted-foreground">
                          ({color.colorCode})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Beskrivelse */}
            {scrapedData.description && (
              <div>
                <Label className="text-sm font-medium">Beskrivelse</Label>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                  {scrapedData.description}
                </p>
              </div>
            )}

            {/* Produktbilder */}
            {downloadedImages && downloadedImages.length > 0 && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Package className="h-4 w-4" />
                  Produktbilder ({downloadedImages.length})
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {downloadedImages.slice(0, 6).map((image, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Produktbilde ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        loading="lazy"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                          Hovedbilde
                        </div>
                      )}
                    </div>
                  ))}
                  {downloadedImages.length > 6 && (
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-600">
                      +{downloadedImages.length - 6} flere
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Bildene er automatisk optimalisert og lagret i høy kvalitet
                </p>
              </div>
            )}

            {/* Kilde info */}
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Hentet fra: {scrapedData.source.siteName}
              </div>
              <div>
                {new Date(scrapedData.source.scrapedAt).toLocaleString('no-NO')}
              </div>
            </div>

            {/* Import knapp */}
            <div className="flex justify-end">
              <Button 
                onClick={handleImport}
                disabled={disabled}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Importer produktdata
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
