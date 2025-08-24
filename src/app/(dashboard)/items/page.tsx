'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Package, 
  Search, 
  Filter,
  MoreVertical,
  MapPin,
  Calendar,
  DollarSign,
  Archive,
  Heart,
  ShoppingCart,
  Tag,
  Edit2,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Grid,
  List
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CameraCaptureCompact } from '@/components/ui/camera-capture'
import { BarcodeScannerCompact, type ProductInfo } from '@/components/ui/barcode-scanner'

import { DynamicFormFields } from '@/components/forms/DynamicFormFields'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'

// Category icons mapping
const categoryIcons: Record<string, string> = {
  'Garn og Strikking': '🧶',
  'Elektronikk': '💻',
  'Mat og Drikke': '🍎',
  'Klær og Tekstiler': '👕',
  'Verktøy og Utstyr': '🔧',
  'Bøker og Medier': '📚',
  'Hobby og Kreativt': '🎨',
  'Helse og Skjønnhet': '💄'
}



export default function ItemsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    totalQuantity: 1,
    unit: 'stk',
    categoryId: '',
    locationId: '',
    price: 0,
    images: [] as string[],
    barcode: '',
    brand: '',
    productInfo: null as ProductInfo | null,
    categoryData: {} as Record<string, any>
  })

  // tRPC queries and mutations
  const { data: itemsData, isLoading, error, refetch } = trpc.items.getAll.useQuery({
    search: searchQuery || undefined,
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    locationId: selectedLocation === 'all' ? undefined : selectedLocation,
    limit: 50
  })
  
  // Extract items from the response object
  const items = itemsData?.items || []
  
  const { data: locations = [] } = trpc.locations.getAll.useQuery()
  const { data: categories = [] } = trpc.categories.getAll.useQuery()
  
  // Get field schema for selected category in create form
  const { data: categoryFieldSchema } = trpc.categories.getFieldSchema.useQuery(
    newItem.categoryId,
    { enabled: !!newItem.categoryId && newItem.categoryId !== 'none' }
  )
  
  // Get field schema for selected category in edit form
  const { data: editCategoryFieldSchema } = trpc.categories.getFieldSchema.useQuery(
    editingItem?.categoryId || '',
    { enabled: !!editingItem?.categoryId && editingItem.categoryId !== 'none' }
  )

  const createItemMutation = trpc.items.create.useMutation({
    onSuccess: () => {
      toast.success('Gjenstand opprettet!')
      setShowCreateForm(false)
      setNewItem({
        name: '',
        description: '',
        totalQuantity: 1,
        unit: 'stk',
        categoryId: '',
        locationId: '',
        price: 0,
        images: [],
        barcode: '',
        brand: '',
        productInfo: null,
        categoryData: {}
      })
      refetch()
    },
    onError: (error: any) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const updateItemMutation = trpc.items.update.useMutation({
    onSuccess: () => {
      toast.success('Gjenstand oppdatert!')
      setEditingItem(null)
      refetch()
    },
    onError: (error: any) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const deleteItemMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      toast.success('Gjenstand slettet!')
      refetch()
    },
    onError: (error: any) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const handleCreateItem = () => {
    if (!newItem.name.trim()) {
      toast.error('Navn er påkrevd')
      return
    }
    if (!newItem.locationId) {
      toast.error('Lokasjon er påkrevd')
      return
    }

    // Validate category-specific required fields
    if ((categoryFieldSchema as any)?.fieldSchema) {
      try {
        const schema = typeof (categoryFieldSchema as any).fieldSchema === 'string' 
          ? JSON.parse((categoryFieldSchema as any).fieldSchema)
          : (categoryFieldSchema as any).fieldSchema

        if (schema.required && Array.isArray(schema.required)) {
          for (const requiredField of schema.required) {
            const value = newItem.categoryData[requiredField]
            if (!value || (typeof value === 'string' && !value.trim())) {
              const fieldLabel = schema.properties?.[requiredField]?.label || requiredField
              toast.error(`${fieldLabel} er påkrevd for ${(categoryFieldSchema as any).name}`)
              return
            }
          }
        }
      } catch (error) {
        console.error('Failed to validate category fields:', error)
      }
    }

    createItemMutation.mutate({
      name: newItem.name,
      description: newItem.description || undefined,
      totalQuantity: newItem.totalQuantity,
      unit: newItem.unit,
      locationId: newItem.locationId,
      categoryId: newItem.categoryId || undefined,
      price: newItem.price || undefined,
      images: newItem.images.length > 0 ? newItem.images : undefined,
      barcode: newItem.barcode || undefined,
      brand: newItem.brand || undefined,
      categoryData: Object.keys(newItem.categoryData).length > 0 ? newItem.categoryData : undefined
    })
  }

  const handleUpdateItem = () => {
    if (!editingItem?.name.trim()) {
      toast.error('Navn er påkrevd')
      return
    }

    // Validate category-specific required fields
    if ((editCategoryFieldSchema as any)?.fieldSchema && editingItem) {
      try {
        const schema = typeof (editCategoryFieldSchema as any).fieldSchema === 'string' 
          ? JSON.parse((editCategoryFieldSchema as any).fieldSchema)
          : (editCategoryFieldSchema as any).fieldSchema

        if (schema.required && Array.isArray(schema.required)) {
          for (const requiredField of schema.required) {
            const value = editingItem.categoryData?.[requiredField]
            if (!value || (typeof value === 'string' && !value.trim())) {
              const fieldLabel = schema.properties?.[requiredField]?.label || requiredField
              toast.error(`${fieldLabel} er påkrevd for ${(editCategoryFieldSchema as any).name}`)
              return
            }
          }
        }
      } catch (error) {
        console.error('Failed to validate category fields:', error)
      }
    }

    updateItemMutation.mutate({
      id: editingItem.id,
      name: editingItem.name,
      description: editingItem.description || undefined,
      totalQuantity: editingItem.totalQuantity,
      unit: editingItem.unit,
      locationId: editingItem.locationId,
      categoryId: editingItem.categoryId || undefined,
      price: editingItem.price || undefined,
      categoryData: editingItem.categoryData && Object.keys(editingItem.categoryData).length > 0 
        ? editingItem.categoryData 
        : undefined
    })
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Er du sikker på at du vil slette denne gjenstanden?')) {
      deleteItemMutation.mutate(itemId)
    }
  }

  const handleBarcodeDetected = (barcode: string, productInfo?: ProductInfo) => {
    setNewItem(prev => ({
      ...prev,
      barcode,
      productInfo: productInfo || null,
      name: productInfo?.name || prev.name,
      brand: productInfo?.brand || prev.brand,
      description: productInfo?.description || prev.description,
      // Auto-select food category if product is from Open Food Facts
      categoryId: productInfo?.source === 'openfoodfacts' && !prev.categoryId 
        ? categories.find((cat: any) => cat.name.toLowerCase().includes('mat'))?.id || prev.categoryId
        : prev.categoryId
    }))
    
    toast.success(`Strekkode ${barcode} lagt til${productInfo?.name ? ` - ${productInfo.name}` : ''}`)
  }

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Laster gjenstander...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av gjenstander</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Prøv igjen</Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (item: any) => {
    if (item.availableQuantity === 0) {
      return <Badge variant="destructive">Tomt</Badge>
    }
    if (item.availableQuantity <= 1) {
      return <Badge variant="secondary">Lavt lager</Badge>
    }
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      return <Badge variant="destructive">Utløpt</Badge>
    }
    return <Badge variant="outline">Tilgjengelig</Badge>
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 cq">
        <div>
          <h1 className="text-3xl font-bold title">Gjenstander</h1>
          <p className="text-muted-foreground secondary-text">
            Administrer alle dine eiendeler og hold oversikt
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <AccessibleButton 
            onClick={() => setShowCreateForm(true)}
            aria-label="Legg til ny gjenstand"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ny gjenstand
          </AccessibleButton>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-row flex flex-col md:flex-row gap-4 mb-6 cq">
        <div className="search-input flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Søk etter gjenstander..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Søk i gjenstander"
          />
        </div>
        <div className="filter-selects flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle kategorier</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Lokasjon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle lokasjoner</SelectItem>
              {locations.map((location: any) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>



      {/* Create Item Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Legg til ny gjenstand</CardTitle>
            <CardDescription>
              Registrer en ny gjenstand i inventaret ditt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-name">Navn på gjenstand</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="F.eks. DROPS garn, iPhone 15, Kaffe"
                />
              </div>
              <div>
                <Label htmlFor="item-quantity">Antall</Label>
                <div className="flex gap-2">
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={newItem.totalQuantity}
                    onChange={(e) => setNewItem({...newItem, totalQuantity: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stk">stk</SelectItem>
                      <SelectItem value="nøste">nøste</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="gram">gram</SelectItem>
                      <SelectItem value="liter">liter</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="item-description">Beskrivelse</Label>
              <Input
                id="item-description"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Beskrivelse av gjenstanden"
              />
            </div>

            
            {/* Image Upload Section */}
            <div>
              <Label>Bilder</Label>
              <CameraCaptureCompact
                onImageCapture={(imageUrl) => {
                  setNewItem(prev => ({
                    ...prev,
                    images: [...prev.images, imageUrl]
                  }))
                }}
                maxImages={5}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Ta bilder av gjenstanden for enklere identifikasjon
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-category">Kategori</Label>
                <Select value={newItem.categoryId} onValueChange={(value) => {
                  setNewItem({...newItem, categoryId: value, categoryData: {}}) // Reset category data when category changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen kategori</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-location">Lokasjon *</Label>
                <Select value={newItem.locationId} onValueChange={(value) => setNewItem({...newItem, locationId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg lokasjon" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location: any) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                        {location.parent && <span className="text-muted-foreground"> (i {location.parent.name})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Category-specific fields */}
            {(categoryFieldSchema as any)?.fieldSchema && (
              <DynamicFormFields
                schema={(() => {
                  try {
                    if (typeof (categoryFieldSchema as any).fieldSchema === 'string') {
                      return JSON.parse((categoryFieldSchema as any).fieldSchema)
                    }
                    return (categoryFieldSchema as any).fieldSchema
                  } catch (error) {
                    console.error('Failed to parse field schema:', error)
                    return null
                  }
                })()}
                values={newItem.categoryData}
                onChange={(categoryData) => setNewItem({...newItem, categoryData})}
                categoryName={(categoryFieldSchema as any).name}
                disabled={createItemMutation.isPending}
              />
            )}
            <div className="flex gap-2">
              <AccessibleButton 
                onClick={handleCreateItem} 
                disabled={createItemMutation.isPending}
                aria-label="Lagre ny gjenstand"
              >
                {createItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oppretter...
                  </>
                ) : (
                  'Legg til gjenstand'
                )}
              </AccessibleButton>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                disabled={createItemMutation.isPending}
                aria-label="Avbryt opprettelse av gjenstand"
              >
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Item Form */}
      {editingItem && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rediger gjenstand</CardTitle>
            <CardDescription>
              Oppdater informasjon om gjenstanden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-item-name">Navn på gjenstand</Label>
                <Input
                  id="edit-item-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  placeholder="F.eks. DROPS garn, iPhone 15, Kaffe"
                />
              </div>
              <div>
                <Label htmlFor="edit-item-quantity">Antall</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-item-quantity"
                    type="number"
                    min="1"
                    value={editingItem.totalQuantity}
                    onChange={(e) => setEditingItem({...editingItem, totalQuantity: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <Select value={editingItem.unit} onValueChange={(value) => setEditingItem({...editingItem, unit: value})}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stk">stk</SelectItem>
                      <SelectItem value="nøste">nøste</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="gram">gram</SelectItem>
                      <SelectItem value="liter">liter</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-item-description">Beskrivelse</Label>
              <Input
                id="edit-item-description"
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                placeholder="Beskrivelse av gjenstanden"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-item-category">Kategori</Label>
                <Select value={editingItem.categoryId || ''} onValueChange={(value) => {
                  setEditingItem({
                    ...editingItem, 
                    categoryId: value,
                    categoryData: value !== editingItem.categoryId ? {} : editingItem.categoryData // Reset if different category
                  })
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen kategori</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-item-location">Lokasjon *</Label>
                <Select value={editingItem.locationId} onValueChange={(value) => setEditingItem({...editingItem, locationId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg lokasjon" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location: any) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                        {location.parent && <span className="text-muted-foreground"> (i {location.parent.name})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Category-specific fields for edit */}
            {(editCategoryFieldSchema as any)?.fieldSchema && editingItem && (
              <DynamicFormFields
                schema={(() => {
                  try {
                    if (typeof (editCategoryFieldSchema as any).fieldSchema === 'string') {
                      return JSON.parse((editCategoryFieldSchema as any).fieldSchema)
                    }
                    return (editCategoryFieldSchema as any).fieldSchema
                  } catch (error) {
                    console.error('Failed to parse field schema:', error)
                    return null
                  }
                })()}
                values={editingItem.categoryData || {}}
                onChange={(categoryData) => setEditingItem({...editingItem, categoryData})}
                categoryName={(editCategoryFieldSchema as any).name}
                disabled={updateItemMutation.isPending}
              />
            )}
            <div className="flex gap-2">
              <AccessibleButton 
                onClick={handleUpdateItem} 
                disabled={updateItemMutation.isPending}
                aria-label="Lagre endringer"
              >
                {updateItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Lagrer...
                  </>
                ) : (
                  'Lagre endringer'
                )}
              </AccessibleButton>
              <Button 
                variant="outline" 
                onClick={() => setEditingItem(null)}
                disabled={updateItemMutation.isPending}
                aria-label="Avbryt redigering"
              >
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Display */}
      {viewMode === 'grid' ? (
        <div className="cq-grid items-grid" style={{"--card-min":"220px"} as any}>
          {items.map((item: any) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow group cursor-pointer">
            <Link href={`/items/${item.id}`} className="block">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {item.category?.icon || categoryIcons[item.category?.name || ''] || '📦'}
                      </span>
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.name}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        aria-label={`Mer handlinger for ${item.name}`}
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingItem(item)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Rediger
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600"
                        disabled={deleteItemMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Slett
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
              </CardHeader>
            
            {/* Images Section */}
            {item.attachments && item.attachments.filter((att: any) => att.type === 'IMAGE').length > 0 && (
              <div className="px-6 pb-3">
                <div className="flex gap-2 overflow-x-auto">
                  {item.attachments
                    .filter((att: any) => att.type === 'IMAGE')
                    .slice(0, 3)
                    .map((attachment: any) => (
                      <div key={attachment.id} className="flex-shrink-0">
                        <img
                          src={attachment.url}
                          alt={attachment.filename}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                    ))}
                  {item.attachments.filter((att: any) => att.type === 'IMAGE').length > 3 && (
                    <div className="flex-shrink-0 w-16 h-16 bg-muted rounded border flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">
                          +{item.attachments.filter((att: any) => att.type === 'IMAGE').length - 3}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <CardContent className="space-y-3">
              {/* Quantity and Unit */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {item.availableQuantity} av {item.totalQuantity} {item.unit}
                </span>
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(Number(item.availableQuantity) / item.totalQuantity) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">
                  {item.location.parent 
                    ? `${item.location.parent.name} > ${item.location.name}`
                    : item.location.name
                  }
                </span>
              </div>

              {/* Purchase Info */}
              <div className="flex items-center justify-between text-sm">
                {item.purchaseDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(item.purchaseDate).toLocaleDateString('no-NO')}</span>
                  </div>
                )}
                {item.price && (
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{Number(item.price)} kr</span>
                  </div>
                )}
              </div>

              {/* Expiry Date */}
              {item.expiryDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600">
                    Utløper: {new Date(item.expiryDate).toLocaleDateString('no-NO')}
                  </span>
                </div>
              )}

              {/* Category-specific info */}
              {item.categoryData && typeof item.categoryData === 'object' && (
                <div className="pt-2 border-t">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {item.category?.name === 'Garn og Strikking' && (
                      <>
                        {(item.categoryData as any).producer && <div>Produsent: {(item.categoryData as any).producer}</div>}
                        {(item.categoryData as any).composition && <div>Sammensetning: {(item.categoryData as any).composition}</div>}
                        {(item.categoryData as any).gauge && <div>Strikkefasthet: {(item.categoryData as any).gauge}</div>}
                      </>
                    )}
                    {item.category?.name === 'Elektronikk' && (
                      <>
                        {(item.categoryData as any).brand && <div>Merke: {(item.categoryData as any).brand}</div>}
                        {(item.categoryData as any).model && <div>Modell: {(item.categoryData as any).model}</div>}
                        {(item.categoryData as any).condition && <div>Tilstand: {(item.categoryData as any).condition}</div>}
                      </>
                    )}
                    {item.category?.name === 'Mat og Drikke' && (
                      <>
                        {(item.categoryData as any).brand && <div>Merke: {(item.categoryData as any).brand}</div>}
                        {(item.categoryData as any).storage && <div>Lagring: {(item.categoryData as any).storage}</div>}
                        {(item.categoryData as any).opened && (item.categoryData as any).openedDate && (
                          <div>Åpnet: {new Date((item.categoryData as any).openedDate).toLocaleDateString('no-NO')}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            </Link>
          </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {items.map((item: any, index: number) => (
                <Link href={`/items/${item.id}`} key={item.id}>
                  <div 
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${index !== items.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                      <span className="text-lg">{item.category?.icon || categoryIcons[item.category?.name || ''] || '📦'}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium line-clamp-1">{item.name}</h3>
                        {getStatusBadge(item)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description || 'Ingen beskrivelse'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {item.availableQuantity} {item.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.location.name}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {item.price && (
                        <div className="text-sm font-medium">
                          {Number(item.price)} kr
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('no-NO')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all' 
              ? 'Ingen gjenstander funnet'
              : 'Ingen gjenstander ennå'
            }
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all'
              ? 'Prøv å endre søket eller filtrene dine'
              : 'Begynn med å legge til din første gjenstand i inventaret'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && selectedLocation === 'all' && (
            <AccessibleButton 
              onClick={() => setShowCreateForm(true)}
              aria-label="Legg til din første gjenstand"
              className="cta-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Legg til første gjenstand
            </AccessibleButton>
          )}
        </div>
      )}
    </div>
  )
}
