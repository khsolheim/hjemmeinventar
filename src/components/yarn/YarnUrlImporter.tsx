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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isDownloadingImage, setIsDownloadingImage] = useState(false)

  // Build proxied URL for preview to avoid hotlink/CORS issues
  const getPreviewSrc = (rawUrl: string) => `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`

  // Ensure URL is valid for schema: add https:// if missing
  const normalizeUrl = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return trimmed
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  const handleScrapeUrl = async () => {
    if (!url.trim()) {
      toast.error('Vennligst skriv inn en URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setScrapedData(null)
    setDownloadedImages(null)
    setSelectedImageIndex(null)

    try {
      const response = await fetch('/api/scrape-yarn-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: normalizeUrl(url),
          downloadImages: false // Start uten å laste ned bilder
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Kunne ikke hente produktinformasjon')
      }

      setScrapedData(result.data)
      setDownloadedImages(null) // Reset downloaded images
      setSelectedImageIndex(null) // Reset selected image
      
      // Debug bildene som blir funnet
      const availableImages = result.data.images?.length || 0
      if (availableImages > 0) {
        console.log('Bilder funnet:', result.data.images)
        result.data.images.forEach((img: any, idx: number) => {
          console.log(`Bilde ${idx + 1}${img.isPrimary ? ' (AI valgte som hovedbilde)' : ''}:`, img.url)
        })
        
        // Finn AI-valgt hovedbilde og last det ned automatisk
        const primaryImageIndex = result.data.images.findIndex((img: any) => img.isPrimary)
        if (primaryImageIndex !== -1) {
          toast.success(`Produktinformasjon hentet! AI valgte bilde ${primaryImageIndex + 1} som hovedbilde av ${availableImages} tilgjengelige.`)
          // Last ned AI-valgt bilde automatisk
          setTimeout(() => {
            handleDownloadImage(primaryImageIndex)
          }, 500) // Kort delay for å la UI oppdatere seg
        } else {
          toast.success(`Produktinformasjon hentet! ${availableImages} bilder tilgjengelig for nedlasting.`)
        }
      } else {
        console.log('Ingen bilder funnet')
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

  const handleDownloadImage = async (imageIndex: number) => {
    if (!scrapedData?.images?.[imageIndex]) {
      toast.error('Bildet finnes ikke')
      return
    }

    setIsDownloadingImage(true)
    setSelectedImageIndex(imageIndex)

    try {
      const response = await fetch('/api/scrape-yarn-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: normalizeUrl(url),
          downloadImages: true,
          selectedImageIndex: imageIndex
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Kunne ikke laste ned bilde')
      }

      setDownloadedImages(result.data.downloadedImages || null)
      toast.success('Bilde lastet ned!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ukjent feil'
      toast.error(`Feil ved nedlasting: ${errorMessage}`)
    } finally {
      setIsDownloadingImage(false)
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
      setSelectedImageIndex(null)
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
                  <div className="mt-1">
                    <span className="font-semibold">{scrapedData.price} {scrapedData.currency || 'kr'}</span>
                    {scrapedData.originalPrice && scrapedData.originalPrice > scrapedData.price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        {scrapedData.originalPrice} {scrapedData.currency || 'kr'}
                      </span>
                    )}
                  </div>
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

              {scrapedData.weightCategory && (
                <div>
                  <Label className="text-sm font-medium">Garnkategori</Label>
                  <p className="mt-1">{scrapedData.weightCategory}</p>
                </div>
              )}

              {scrapedData.gauge && (
                <div>
                  <Label className="text-sm font-medium">Strikkefasthet</Label>
                  <p className="mt-1">{scrapedData.gauge}</p>
                </div>
              )}

              {scrapedData.sku && (
                <div>
                  <Label className="text-sm font-medium">Produktkode</Label>
                  <p className="mt-1 font-mono text-sm">{scrapedData.sku}</p>
                </div>
              )}

              {scrapedData.availability && (
                <div>
                  <Label className="text-sm font-medium">Tilgjengelighet</Label>
                  <p className="mt-1">
                    <Badge variant={
                      scrapedData.availability.toLowerCase().includes('lager') ? 'default' :
                      scrapedData.availability.toLowerCase().includes('utsolgt') ? 'destructive' : 'secondary'
                    }>
                      {scrapedData.availability}
                    </Badge>
                  </p>
                </div>
              )}

              {scrapedData.countryOfOrigin && (
                <div>
                  <Label className="text-sm font-medium">Produksjonsland</Label>
                  <p className="mt-1">{scrapedData.countryOfOrigin}</p>
                </div>
              )}

              {scrapedData.rating && (
                <div>
                  <Label className="text-sm font-medium">Kundevurdering</Label>
                  <p className="mt-1">
                    ⭐ {scrapedData.rating}/5
                    {scrapedData.reviewCount && (
                      <span className="text-sm text-muted-foreground ml-1">
                        ({scrapedData.reviewCount} anmeldelser)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Vaskeråd */}
            {scrapedData.careInstructions && (
              <div>
                <Label className="text-sm font-medium">Vaskeråd</Label>
                <p className="mt-1 text-sm">{scrapedData.careInstructions}</p>
              </div>
            )}

            {/* Sertifiseringer */}
            {scrapedData.certifications && scrapedData.certifications.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Sertifiseringer</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scrapedData.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Leveringsinformasjon */}
            {scrapedData.deliveryInfo && (
              <div>
                <Label className="text-sm font-medium">Levering</Label>
                <p className="mt-1 text-sm text-muted-foreground">{scrapedData.deliveryInfo}</p>
              </div>
            )}

            {/* Ekstra spesifikasjoner */}
            {scrapedData.specifications && Object.keys(scrapedData.specifications).length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2">Ekstra spesifikasjoner</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(scrapedData.specifications).map(([key, value], index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Relaterte oppskrifter */}
            {scrapedData.relatedPatterns && scrapedData.relatedPatterns.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Relaterte oppskrifter</Label>
                <div className="mt-1 space-y-1">
                  {scrapedData.relatedPatterns.slice(0, 3).map((pattern, index) => (
                    <a 
                      key={index} 
                      href={pattern} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Oppskrift {index + 1}
                    </a>
                  ))}
                  {scrapedData.relatedPatterns.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{scrapedData.relatedPatterns.length - 3} flere oppskrifter
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bildevalg - vis kun ett bilde (AI-valgt eller første) og bruk proxy for forhåndsvisning */}
            {scrapedData.images && scrapedData.images.length > 0 && (() => {
              const primaryIndex = scrapedData.images.findIndex((img: any) => img.isPrimary)
              const indexToShow = primaryIndex !== -1 ? primaryIndex : 0
              const image = scrapedData.images[indexToShow]
              return (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Package className="h-4 w-4" />
                    Forhåndsvisning av bilde
                  </Label>
                  <div className="rounded-lg border bg-white p-2 max-w-sm">
                    <div className="aspect-square w-full overflow-hidden rounded-md">
                      <img
                        src={getPreviewSrc(image.url)}
                        alt={image.alt || `Produktbilde`}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Feil ved lasting av bilde (proxy), prøver direkte URL:', image.url)
                          const target = e.target as HTMLImageElement
                          // Fallback til direkte URL én gang
                          if (!(target as any)._triedFallback) {
                            ;(target as any)._triedFallback = true
                            target.src = image.url
                          } else {
                            target.src = ''
                            target.alt = 'Bilde kunne ikke lastes'
                          }
                        }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {image.isPrimary && (
                        <span className="text-xs rounded bg-green-600 px-1.5 py-0.5 text-white">🤖 AI valgt</span>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleDownloadImage(indexToShow)}
                        disabled={isDownloadingImage}
                        variant="secondary"
                      >
                        {isDownloadingImage && selectedImageIndex === indexToShow ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Laster...
                          </>
                        ) : (
                          <>
                            <Download className="mr-1 h-3 w-3" />
                            Last ned
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Nedlastet bilde */}
            {downloadedImages && downloadedImages.length > 0 && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Nedlastet bilde
                </Label>
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={downloadedImages[0].url}
                    alt="Nedlastet produktbilde"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Bildet er optimalisert og lagret ({downloadedImages[0].filesize} bytes)
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
