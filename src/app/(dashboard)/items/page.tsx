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
  Tag
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock data for demonstration
const mockItems = [
  {
    id: '1',
    name: 'DROPS Melody Garn - Perlegrå',
    description: '71% Alpakka, 25% Ull, 4% Polyamid - 140m/50g',
    imageUrl: '/placeholder-yarn.jpg',
    totalQuantity: 5,
    availableQuantity: 3,
    unit: 'nøste',
    category: 'Garn og Strikking',
    location: 'Soverom > Strikkeskap',
    purchaseDate: '2024-01-15',
    price: 89,
    tags: ['alpakka', 'vinter-prosjekt'],
    categoryData: {
      producer: 'DROPS Design',
      composition: '71% Alpakka, 25% Ull, 4% Polyamid',
      yardage: '140m',
      weight: '50g',
      gauge: '14 m x 19 v = 10cm²',
      needleSize: '7mm',
      careInstructions: 'Håndvask maks 30°C. Plantørking.'
    }
  },
  {
    id: '2',
    name: 'Apple MacBook Pro 14"',
    description: 'M3 Pro chip, 18GB RAM, 512GB SSD',
    imageUrl: '/placeholder-laptop.jpg',
    totalQuantity: 1,
    availableQuantity: 1,
    unit: 'stk',
    category: 'Elektronikk',
    location: 'Hjemmekontor > Skrivebord',
    purchaseDate: '2023-11-20',
    price: 29990,
    tags: ['arbeid', 'verdifull'],
    categoryData: {
      brand: 'Apple',
      model: 'MacBook Pro 14-inch',
      serialNumber: 'C02XL1234567',
      warrantyExpiry: '2026-11-20',
      condition: 'Som ny'
    }
  },
  {
    id: '3',
    name: 'Økologisk Kokosolje',
    description: 'Kaldpresset, uraffinert kokosolje 500ml',
    imageUrl: '/placeholder-coconut-oil.jpg',
    totalQuantity: 2,
    availableQuantity: 1.5,
    unit: 'flaske',
    category: 'Mat og Drikke',
    location: 'Kjøkken > Skap',
    purchaseDate: '2024-01-10',
    expiryDate: '2025-01-10',
    price: 129,
    tags: ['økologisk', 'cooking'],
    categoryData: {
      brand: 'Urtekram',
      storage: 'Tørt og kjølig',
      opened: true,
      openedDate: '2024-01-15'
    }
  }
]

const categoryIcons = {
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
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    totalQuantity: 1,
    unit: 'stk',
    categoryId: '',
    locationId: '',
    price: 0
  })

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesLocation = selectedLocation === 'all' || item.location.includes(selectedLocation)
    return matchesSearch && matchesCategory && matchesLocation
  })

  const handleCreateItem = () => {
    console.log('Creating item:', newItem)
    setShowCreateForm(false)
    setNewItem({
      name: '',
      description: '',
      totalQuantity: 1,
      unit: 'stk',
      categoryId: '',
      locationId: '',
      price: 0
    })
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gjenstander</h1>
          <p className="text-muted-foreground">
            Administrer alle dine eiendeler og hold oversikt
          </p>
        </div>
        <AccessibleButton 
          onClick={() => setShowCreateForm(true)}
          aria-label="Legg til ny gjenstand"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ny gjenstand
        </AccessibleButton>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Søk etter gjenstander..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Søk i gjenstander"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle kategorier</SelectItem>
            <SelectItem value="Garn og Strikking">🧶 Garn og Strikking</SelectItem>
            <SelectItem value="Elektronikk">💻 Elektronikk</SelectItem>
            <SelectItem value="Mat og Drikke">🍎 Mat og Drikke</SelectItem>
            <SelectItem value="Klær og Tekstiler">👕 Klær og Tekstiler</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Lokasjon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle lokasjoner</SelectItem>
            <SelectItem value="Kjøkken">Kjøkken</SelectItem>
            <SelectItem value="Soverom">Soverom</SelectItem>
            <SelectItem value="Hjemmekontor">Hjemmekontor</SelectItem>
          </SelectContent>
        </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-category">Kategori</Label>
                <Select value={newItem.categoryId} onValueChange={(value) => setNewItem({...newItem, categoryId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="garn">🧶 Garn og Strikking</SelectItem>
                    <SelectItem value="elektronikk">💻 Elektronikk</SelectItem>
                    <SelectItem value="mat">🍎 Mat og Drikke</SelectItem>
                    <SelectItem value="klær">👕 Klær og Tekstiler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-location">Lokasjon</Label>
                <Select value={newItem.locationId} onValueChange={(value) => setNewItem({...newItem, locationId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg lokasjon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kjokken">Kjøkken</SelectItem>
                    <SelectItem value="soverom">Soverom</SelectItem>
                    <SelectItem value="kontor">Hjemmekontor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <AccessibleButton onClick={handleCreateItem} aria-label="Lagre ny gjenstand">
                Legg til gjenstand
              </AccessibleButton>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                aria-label="Avbryt opprettelse av gjenstand"
              >
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {categoryIcons[item.category as keyof typeof categoryIcons] || '📦'}
                    </span>
                    <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" aria-label={`Mer handlinger for ${item.name}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{item.category}</Badge>
                {getStatusBadge(item)}
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            
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
                      width: `${(item.availableQuantity / item.totalQuantity) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{item.location}</span>
              </div>

              {/* Purchase Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(item.purchaseDate).toLocaleDateString('no-NO')}</span>
                </div>
                {item.price && (
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{item.price} kr</span>
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
              {item.categoryData && (
                <div className="pt-2 border-t">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {item.category === 'Garn og Strikking' && (
                      <>
                        <div>Produsent: {item.categoryData.producer}</div>
                        <div>Sammensetning: {item.categoryData.composition}</div>
                        <div>Strikkefasthet: {item.categoryData.gauge}</div>
                      </>
                    )}
                    {item.category === 'Elektronikk' && (
                      <>
                        <div>Merke: {item.categoryData.brand}</div>
                        <div>Modell: {item.categoryData.model}</div>
                        <div>Tilstand: {item.categoryData.condition}</div>
                      </>
                    )}
                    {item.category === 'Mat og Drikke' && (
                      <>
                        <div>Merke: {item.categoryData.brand}</div>
                        <div>Lagring: {item.categoryData.storage}</div>
                        {item.categoryData.opened && (
                          <div>Åpnet: {new Date(item.categoryData.openedDate).toLocaleDateString('no-NO')}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
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
