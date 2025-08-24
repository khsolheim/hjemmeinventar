'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Package,
  MapPin,
  Search,
  QrCode,
  TrendingUp,
  Loader2,
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  Box,
  Home,
  Building,
  Grid3x3,
  TreePine,
  List,
  Archive,
  Users,
  Calendar,
  BarChart3,
  Settings,
  X
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { NotificationSummary } from '@/components/notifications/NotificationCenter'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { NotificationTest } from '@/components/notifications/NotificationTest'

type Location = {
  id: string
  name: string
  description?: string | null
  type: string
  children?: Location[]
  _count: { items: number }
}

type BreadcrumbItem = {
  id: string
  name: string
  type: string
}

export default function DashboardPage() {
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = trpc.items.getAll.useQuery({ limit: 1000 })
  const { data: locations = [], isLoading: locationsLoading, error: locationsError } = trpc.locations.getAll.useQuery()
  const { data: activities = [], isLoading: activitiesLoading, error: activitiesError } = trpc.activities.getRecent.useQuery({ limit: 5 })

  // Loading and error states
  const isLoading = itemsLoading || locationsLoading || activitiesLoading
  const hasErrors = itemsError || locationsError || activitiesError
  const needsAuth = itemsError?.data?.code === 'UNAUTHORIZED' || locationsError?.data?.code === 'UNAUTHORIZED'

  // Extract items from the response
  const items = itemsData?.items || []

  // Helper functions
  const findLocationById = (locations: Location[], id: string): Location | null => {
    for (const location of locations) {
      if (location.id === id) return location
      if (location.children) {
        const found = findLocationById(location.children, id)
        if (found) return found
      }
    }
    return null
  }

  const currentLocation = currentLocationId ? findLocationById(locations, currentLocationId) : null
  const currentLocationChildren = currentLocation?.children || []

  const currentLocationItems = currentLocationId
    ? items.filter((item: any) => item.locationId === currentLocationId)
    : []

  const navigateToLocation = (location: Location) => {
    setCurrentLocationId(location.id)
    setBreadcrumbs(prev => [...prev, { id: location.id, name: location.name, type: location.type }])
  }

  const navigateBack = () => {
    const newBreadcrumbs = breadcrumbs.slice(0, -1)
    setBreadcrumbs(newBreadcrumbs)
    const previousLocationId = newBreadcrumbs.length > 0 ? newBreadcrumbs[newBreadcrumbs.length - 1]?.id || null : null
    setCurrentLocationId(previousLocationId)
  }

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1)
    setBreadcrumbs(newBreadcrumbs)
    const breadcrumb = newBreadcrumbs[index]
    if (breadcrumb) {
      setCurrentLocationId(breadcrumb.id)
    }
  }

  const resetToRoot = () => {
    setCurrentLocationId(null)
    setBreadcrumbs([])
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'ROOM': return <Home className="w-5 h-5" />
      case 'CABINET': return <Building className="w-5 h-5" />
      case 'SHELF': return <FolderOpen className="w-5 h-5" />
      case 'BOX': return <Box className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'ROOM': return 'Rom'
      case 'CABINET': return 'Skap'
      case 'SHELF': return 'Hylle'
      case 'BOX': return 'Boks'
      default: return type
    }
  }

  // Filter locations and items based on search
  const filteredLocations = (currentLocationId ? currentLocationChildren : locations).filter((location: Location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredItems = (currentLocationId ? currentLocationItems : items).filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Statistics
  const totalItems = items.length
  const totalLocations = locations.length
  const itemsInCurrentLocation = currentLocationItems.length
  const locationsInCurrentLocation = currentLocationChildren.length

  if (needsAuth) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Autentisering påkrevd</h3>
          <p className="text-sm text-muted-foreground mb-4">Du må være innlogget for å se denne siden</p>
          <Link href="/auth/signin">
            <Button>Logg inn</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (hasErrors) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {itemsError?.message || locationsError?.message || 'Ukjent feil'}
          </p>
          <Button onClick={() => window.location.reload()}>Prøv igjen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header with dynamic title and navigation */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {currentLocationId ? (
                <>
                  <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={navigateBack} />
                  <span>{currentLocation?.name}</span>
                </>
              ) : (
                <>
                  <Home className="w-6 h-6" />
                  <span>Dashboard</span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentLocationId 
                ? 'Oversikt over lokasjon og innhold'
                : 'Oversikt over alle lokasjoner og gjenstander'
              }
            </p>
          </div>
          
          {currentLocationId && (
            <Button variant="outline" onClick={resetToRoot}>
              Tilbake til hovedoversikt
            </Button>
          )}
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="text-muted-foreground">Du er her:</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetToRoot}
              className="h-auto p-1 text-blue-600 hover:text-blue-700"
            >
              Hjem
            </Button>
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateToBreadcrumb(index)}
                  className="h-auto p-1 text-blue-600 hover:text-blue-700"
                >
                  {breadcrumb.name}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* PWA Install Prompt */}
        <InstallPrompt />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Totalt gjenstander</p>
                  <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Totalt lokasjoner</p>
                  <p className="text-2xl font-bold text-green-900">{totalLocations}</p>
                </div>
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    {currentLocationId ? 'Gjenstander her' : 'Aktive lån'}
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {currentLocationId ? itemsInCurrentLocation : 0}
                  </p>
                </div>
                {currentLocationId ? (
                  <Archive className="w-8 h-8 text-purple-600" />
                ) : (
                  <Users className="w-8 h-8 text-purple-600" />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">
                    {currentLocationId ? 'Underlokasjoner' : 'Nylige aktiviteter'}
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {currentLocationId ? locationsInCurrentLocation : (activities && 'activities' in activities ? activities.activities?.length : 0)}
                  </p>
                </div>
                {currentLocationId ? (
                  <FolderOpen className="w-8 h-8 text-orange-600" />
                ) : (
                  <Calendar className="w-8 h-8 text-orange-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Søk etter lokasjoner eller gjenstander..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Oversikt
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              Hierarki
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Liste
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Locations Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentLocationId ? (
                      <>
                        <ArrowLeft className="w-5 h-5" />
                        <span>Underlokasjoner i {currentLocation?.name}</span>
                      </>
                    ) : (
                      <>
                        <Grid3x3 className="w-5 h-5" />
                        <span>Lokasjoner</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {currentLocationId
                      ? 'Klikk på en underlokasjon for å se innholdet'
                      : 'Klikk på en lokasjon for å se innholdet og underlokasjoner'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Laster lokasjoner...</span>
                    </div>
                  ) : filteredLocations.length > 0 ? (
                    <div className="space-y-3">
                      {filteredLocations.map((location: Location) => (
                        <div
                          key={location.id}
                          className="group flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 border-l-4 border-l-blue-500"
                          onClick={() => navigateToLocation(location)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              {getLocationIcon(location.type)}
                            </div>
                            <div>
                              <h3 className="font-medium group-hover:text-blue-600 transition-colors">{location.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {getLocationTypeLabel(location.type)}
                                </Badge>
                                <span>•</span>
                                <span>{location._count.items} gjenstander</span>
                                {location.children && location.children.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{location.children.length} underlokasjoner</span>
                                  </>
                                )}
                              </div>
                              {location.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {location.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {searchTerm ? 'Ingen lokasjoner funnet' : (currentLocationId ? 'Ingen underlokasjoner' : 'Ingen lokasjoner')}
                      </p>
                      <p className="text-sm">
                        {searchTerm 
                          ? 'Prøv å endre søket ditt'
                          : (currentLocationId
                            ? 'Denne lokasjonen har ingen underlokasjoner'
                            : 'Opprett dine første lokasjoner for å komme i gang'
                          )
                        }
                      </p>
                      {!currentLocationId && !searchTerm && (
                        <Button asChild className="mt-4">
                          <Link href="/locations">
                            <Plus className="w-4 h-4 mr-2" />
                            Opprett lokasjon
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Items Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <span>
                      {currentLocationId ? `Gjenstander i ${currentLocation?.name}` : 'Alle gjenstander'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {currentLocationId
                      ? 'Gjenstander som er lagret på denne lokasjonen'
                      : 'Oversikt over alle gjenstander i inventaret'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Laster gjenstander...</span>
                    </div>
                  ) : filteredItems.length > 0 ? (
                    <div className="space-y-3">
                      {filteredItems.slice(0, 10).map((item: any) => (
                        <div key={item.id} className="group flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <span className="text-sm">
                              {item.category?.icon || '📦'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span>{item.availableQuantity} {item.unit}</span>
                              {!currentLocationId && item.location && (
                                <>
                                  <span>•</span>
                                  <span>{item.location.name}</span>
                                </>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <Link href={`/items/${item.id}`}>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {filteredItems.length > 10 && (
                        <div className="text-center pt-4">
                          <Link href={currentLocationId ? `/items?location=${currentLocationId}` : '/items'}>
                            <Button variant="outline">
                              Vis alle gjenstander ({filteredItems.length})
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {searchTerm ? 'Ingen gjenstander funnet' : (currentLocationId ? 'Ingen gjenstander på denne lokasjonen' : 'Ingen gjenstander')}
                      </p>
                      <p className="text-sm">
                        {searchTerm 
                          ? 'Prøv å endre søket ditt'
                          : (currentLocationId
                            ? 'Denne lokasjonen har ingen gjenstander'
                            : 'Legg til dine første gjenstander for å komme i gang'
                          )
                        }
                      </p>
                      {!currentLocationId && !searchTerm && (
                        <Button asChild className="mt-4">
                          <Link href="/items">
                            <Plus className="w-4 h-4 mr-2" />
                            Legg til gjenstand
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hierarchy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="w-5 h-5" />
                  <span>Hierarkisk visning</span>
                </CardTitle>
                <CardDescription>
                  Se alle lokasjoner i hierarkisk struktur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((location: Location) => (
                    <HierarchyItem key={location.id} location={location} level={0} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  <span>Liste-visning</span>
                </CardTitle>
                <CardDescription>
                  Kompakt liste over alle lokasjoner og gjenstander
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredLocations.map((location: Location) => (
                    <div key={location.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {getLocationIcon(location.type)}
                        <span className="font-medium">{location.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getLocationTypeLabel(location.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{location._count.items} gjenstander</span>
                        {location.children && location.children.length > 0 && (
                          <span>{location.children.length} underlokasjoner</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigateToLocation(location)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activities */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Nylige aktiviteter</span>
            </CardTitle>
            <CardDescription>
              Oversikt over dine siste handlinger
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Laster aktiviteter...</span>
              </div>
            ) : activities && 'activities' in activities && activities.activities?.length > 0 ? (
              <div className="space-y-3">
                {activities.activities.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString('no-NO', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ingen aktiviteter ennå</p>
                <p className="text-sm">
                  Aktiviteter vil vises her når du begynner å bruke systemet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Test */}
        <NotificationTest />
      </div>
    </div>
  )
}

// Helper component for hierarchy view
function HierarchyItem({ location, level }: { location: Location; level: number }) {
  const [isExpanded, setIsExpanded] = useState(level === 0)
  
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'ROOM': return <Home className="w-4 h-4" />
      case 'CABINET': return <Building className="w-4 h-4" />
      case 'SHELF': return <FolderOpen className="w-4 h-4" />
      case 'BOX': return <Box className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }
  
  return (
    <div className="ml-4">
      <div 
        className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {location.children && location.children.length > 0 && (
          <ChevronRight 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          />
        )}
        {getLocationIcon(location.type)}
        <span className="font-medium">{location.name}</span>
        <Badge variant="outline" className="text-xs">
          {location._count.items} gjenstander
        </Badge>
        {location.children && location.children.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {location.children.length} underlokasjoner
          </Badge>
        )}
      </div>
      
      {isExpanded && location.children && location.children.length > 0 && (
        <div className="ml-4 mt-2">
          {location.children.map((child) => (
            <HierarchyItem key={child.id} location={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
