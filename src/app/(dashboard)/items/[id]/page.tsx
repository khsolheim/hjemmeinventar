'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  Archive,
  User,
  Image as ImageIcon,
  Loader2,
  Heart,
  Share2,
  Download,
  Tag,
  Barcode
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  const itemId = params.id as string
  
  const { data: item, isLoading, error } = trpc.items.getById.useQuery(itemId, {
    enabled: !!itemId
  })
  
  const deleteItemMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      toast.success('Gjenstand slettet!')
      router.push('/items')
    },
    onError: (error) => {
      toast.error(`Feil ved sletting: ${error.message}`)
    }
  })

  const handleDeleteItem = () => {
    deleteItemMutation.mutate(itemId)
  }

  const getStatusBadge = (item: any) => {
    if (item.availableQuantity === 0) {
      return <Badge variant="destructive">Tomt</Badge>
    }
    if (item.availableQuantity <= 1) {
      return <Badge variant="secondary">Lavt lager</Badge>
    }
    if (item.loan?.status === 'OUT') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Utlånt</Badge>
    }
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      return <Badge variant="destructive">Utløpt</Badge>
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700">Tilgjengelig</Badge>
  }

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Laster gjenstand...</span>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Gjenstand ikke funnet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error?.message || 'Gjenstanden du leter etter eksisterer ikke eller har blitt slettet.'}
          </p>
          <Button asChild>
            <Link href="/items">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til gjenstander
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const images = item.attachments?.filter((att: any) => att.type === 'IMAGE') || []

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 cq">
        <Button variant="outline" size="sm" asChild>
          <Link href="/items">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {item.category?.icon || '📦'}
          </span>
          <h1 className="text-3xl font-bold title">{item.name}</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Favoritt
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Del
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/items/${item.id}/edit`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Rediger
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Slett
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                <AlertDialogDescription>
                  Denne handlingen kan ikke angres. Gjenstanden "{item.name}" vil bli permanent slettet.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteItem}
                  disabled={deleteItemMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteItemMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sletter...
                    </>
                  ) : (
                    'Slett gjenstand'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="detail-panel gap-8">
        {/* Left Column - Images and Gallery */}
        <div>
          {images.length > 0 ? (
            <div className="space-y-4">
              {/* Main Image */}
              <Card>
                <CardContent className="p-0 min-h-[320px]">
                  <img
                    src={images[selectedImageIndex]?.url}
                    alt={images[selectedImageIndex]?.filename}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image: any, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        selectedImageIndex === index ? 'border-primary' : 'border-border'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center min-h-[320px]">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">Ingen bilder tilgjengelig</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Status and Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.category && <Badge variant="secondary">{item.category.name}</Badge>}
            {getStatusBadge(item)}
            {item.tags?.map((tag: any) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Description */}
          {item.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Beskrivelse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Location Information - Prominent Display */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Lokasjon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">
                {item.location.name}
              </div>
              {item.location.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {item.location.description}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quantity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mengde og tilgjengelighet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Totalt antall</div>
                  <div className="text-2xl font-bold">
                    {item.totalQuantity} {item.unit}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Tilgjengelig</div>
                  <div className="text-2xl font-bold text-green-600">
                    {item.availableQuantity} {item.unit}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Brukt/forbrukt</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {item.consumedQuantity || 0} {item.unit}
                  </div>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all relative"
                  style={{ 
                    width: `${Math.min((Number(item.availableQuantity) / item.totalQuantity) * 100, 100)}%` 
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                    {Math.round((Number(item.availableQuantity) / item.totalQuantity) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grunnleggende informasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                {item.category && (
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Kategori</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        {item.category.icon && <span>{item.category.icon}</span>}
                        {item.category.name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Unit */}
                <div className="flex items-center gap-3">
                  <Archive className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Enhet</div>
                    <div className="text-sm text-muted-foreground">
                      {item.unit}
                    </div>
                  </div>
                </div>

                {/* Price */}
                {item.price && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Pris</div>
                      <div className="text-sm text-muted-foreground">
                        {Number(item.price)} kr
                      </div>
                    </div>
                  </div>
                )}

                {/* Brand */}
                {item.brand && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Merke</div>
                      <div className="text-sm text-muted-foreground">
                        {item.brand}
                      </div>
                    </div>
                  </div>
                )}

                {/* Barcode */}
                {item.barcode && (
                  <div className="flex items-center gap-3">
                    <Barcode className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Strekkode</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {item.barcode}
                      </div>
                    </div>
                  </div>
                )}

                {/* Image URL (if exists but no attachments) */}
                {item.imageUrl && (!item.attachments || item.attachments.length === 0) && (
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Bilde-URL</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.imageUrl}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datoer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Created At */}
                {item.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Registrert</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('no-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Updated At */}
                {item.updatedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Sist oppdatert</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString('no-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchase Date */}
                {item.purchaseDate && (
                  <div className="flex items-center gap-3">
                    <Archive className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Kjøpsdato</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.purchaseDate).toLocaleDateString('no-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expiry Date */}
                {item.expiryDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-medium">Utløpsdato</div>
                      <div className={`text-sm ${
                        new Date(item.expiryDate) < new Date() 
                          ? 'text-red-600 font-medium' 
                          : 'text-orange-600'
                      }`}>
                        {new Date(item.expiryDate).toLocaleDateString('no-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {new Date(item.expiryDate) < new Date() && (
                          <span className="ml-2 text-red-600">⚠️ Utløpt</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category-specific Information */}
          {item.categoryData && typeof item.categoryData === 'object' && Object.keys(item.categoryData).length > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-500" />
                  {item.category?.name ? `${item.category.name} - Spesifikke detaljer` : 'Tilpassede felter'}
                </CardTitle>
                <CardDescription>
                  Kategori-spesifikk informasjon for denne gjenstanden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(item.categoryData as Record<string, any>).map(([key, value]) => {
                    if (!value && value !== 0 && value !== false) return null
                    
                    // Format the key to be more readable
                    const formatKey = (key: string) => {
                      const keyMap: Record<string, string> = {
                        // Garn og Strikking
                        producer: 'Produsent',
                        composition: 'Sammensetning', 
                        gauge: 'Strikkefasthet',
                        yarnWeight: 'Garntykkelse',
                        needleSize: 'Pinner/krok størrelse',
                        colorCode: 'Fargekode',
                        dyelot: 'Fargebad',
                        length: 'Lengde',
                        weight: 'Vekt',
                        
                        // Elektronikk
                        brand: 'Merke',
                        model: 'Modell',
                        condition: 'Tilstand',
                        serialNumber: 'Serienummer',
                        warranty: 'Garanti',
                        warrantyExpiry: 'Garanti utløper',
                        powerConsumption: 'Strømforbruk',
                        
                        // Mat og Drikke
                        storage: 'Lagring',
                        opened: 'Åpnet',
                        openedDate: 'Dato åpnet',
                        nutritionalInfo: 'Næringsinnhold',
                        allergens: 'Allergener',
                        origin: 'Opprinnelse',
                        organic: 'Økologisk',
                        
                        // Klær og Tekstiler
                        size: 'Størrelse',
                        color: 'Farge',
                        material: 'Materiale',
                        careInstructions: 'Vaskeanvisning',
                        season: 'Sesong',
                        
                        // Verktøy og Utstyr
                        toolType: 'Verktøytype',
                        powerSource: 'Strømkilde',
                        voltage: 'Spenning',
                        batteryType: 'Batteritype',
                        
                        // Generelle felt
                        notes: 'Notater',
                        instructions: 'Instruksjoner',
                        manual: 'Manual/bruksanvisning',
                        website: 'Nettside'
                      }
                      return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
                    }

                    const formatValue = (value: any) => {
                      if (typeof value === 'boolean') {
                        return value ? '✅ Ja' : '❌ Nei'
                      }
                      if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
                        return new Date(value).toLocaleDateString('no-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      }
                      if (typeof value === 'number') {
                        return value.toLocaleString('no-NO')
                      }
                      return String(value)
                    }

                    const getIcon = (key: string) => {
                      const iconMap: Record<string, string> = {
                        producer: '🏭',
                        brand: '🏷️',
                        model: '📱',
                        condition: '⚙️',
                        storage: '🏠',
                        size: '📏',
                        color: '🎨',
                        weight: '⚖️',
                        temperature: '🌡️',
                        opened: '📅',
                        organic: '🌱',
                        warranty: '🛡️',
                        manual: '📖',
                        notes: '📝'
                      }
                      return iconMap[key] || '📋'
                    }

                    return (
                      <div key={key} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg">{getIcon(key)}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{formatKey(key)}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatValue(value)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {(item.tags && item.tags.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag: any) => (
                    <Badge key={tag.id} variant="outline" className="text-sm">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                Systeminformasjon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Item ID</div>
                  <div className="text-muted-foreground font-mono">{item.id}</div>
                </div>
                {item.userId && (
                  <div>
                    <div className="font-medium">Eier ID</div>
                    <div className="text-muted-foreground font-mono">{item.userId}</div>
                  </div>
                )}
                {item.locationId && (
                  <div>
                    <div className="font-medium">Lokasjon ID</div>
                    <div className="text-muted-foreground font-mono">{item.locationId}</div>
                  </div>
                )}
                {item.categoryId && (
                  <div>
                    <div className="font-medium">Kategori ID</div>
                    <div className="text-muted-foreground font-mono">{item.categoryId}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loan Information */}
          {item.loan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Utlånsinformasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={item.loan.status === 'OUT' ? 'destructive' : 'outline'}>
                      {item.loan.status === 'OUT' ? 'Utlånt' : 'Returnert'}
                    </Badge>
                  </div>
                  {item.loan.loanedTo && (
                    <div className="flex justify-between">
                      <span>Låntaker:</span>
                      <span>{item.loan.loanedTo}</span>
                    </div>
                  )}
                  {item.loan.loanDate && (
                    <div className="flex justify-between">
                      <span>Utlånt dato:</span>
                      <span>{new Date(item.loan.loanDate).toLocaleDateString('no-NO')}</span>
                    </div>
                  )}
                  {item.loan.expectedReturnDate && (
                    <div className="flex justify-between">
                      <span>Forventet retur:</span>
                      <span>{new Date(item.loan.expectedReturnDate).toLocaleDateString('no-NO')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
