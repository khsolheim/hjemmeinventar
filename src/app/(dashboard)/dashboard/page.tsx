'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
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
  Grid3x3
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { NotificationSummary } from '@/components/notifications/NotificationCenter'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { NotificationTest } from '@/components/notifications/NotificationTest'
import { Badge } from '@/components/ui/badge'

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

  // Fetch dashboard data
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = trpc.items.getAll.useQuery({ limit: 1000 })
  const { data: locations = [], isLoading: locationsLoading, error: locationsError } = trpc.locations.getAll.useQuery()
  const { data: activities = [], isLoading: activitiesLoading, error: activitiesError } = trpc.activities.getRecent.useQuery({ limit: 5 })

  const isLoading = itemsLoading || locationsLoading
  const hasErrors = itemsError || locationsError || activitiesError

  // Check if user needs to login
  const needsAuth = itemsError?.message?.includes('UNAUTHORIZED') || 
                   locationsError?.message?.includes('UNAUTHORIZED') ||
                   activitiesError?.message?.includes('UNAUTHORIZED')

  if (needsAuth) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>🔐 Innlogging påkrevd</CardTitle>
            <CardDescription>
              Du må logge deg inn for å få tilgang til dashbordet
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Bruk følgende testbruker:
            </p>
            <div className="bg-muted p-3 rounded text-sm">
              <div><strong>Email:</strong> test@example.com</div>
              <div><strong>Passord:</strong> test123</div>
            </div>
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Gå til innlogging
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extract items from the response object
  const items = itemsData?.items || []

  // Calculate stats
  const totalItems = items.length
  const totalLocations = locations.length
  const totalQRCodes = locations.length
  const thisMonthItems = items.filter((item: any) => {
    const createdDate = new Date(item.createdAt)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
  }).length

  // Helper function to find location by ID (including nested)
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

  // Get current location and its children
  const currentLocation = currentLocationId ? findLocationById(locations, currentLocationId) : null
  const currentLocationChildren = currentLocation?.children || []
  
  // Get items for current location
  const currentLocationItems = currentLocationId 
    ? items.filter((item: any) => item.locationId === currentLocationId)
    : []

  // Navigation functions
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

  // Get location icon based on type
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'ROOM': return <Home className="w-5 h-5" />
      case 'BUILDING': return <Building className="w-5 h-5" />
      case 'STORAGE': return <Box className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  // Get location type label
  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'ROOM': return 'Rom'
      case 'BUILDING': return 'Bygning'
      case 'STORAGE': return 'Oppbevaring'
      default: return 'Lokasjon'
    }
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Error Display */}
      {hasErrors && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Dashboard Feil</CardTitle>
            <CardDescription className="text-red-600">
              Det oppstod problemer med å laste dashboard data.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-red-700">
            {itemsError && <div>Items feil: {itemsError.message}</div>}
            {locationsError && <div>Locations feil: {locationsError.message}</div>}
            {activitiesError && <div>Activities feil: {activitiesError.message}</div>}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Last siden på nytt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {currentLocationId ? `Lokasjon: ${currentLocation?.name}` : 'Velkommen tilbake! Her er en oversikt over inventaret ditt.'}
          </p>
        </div>
        <div className="flex gap-2">
          {currentLocationId && (
            <Button variant="outline" onClick={resetToRoot}>
              <Home className="w-4 h-4 mr-2" />
              Tilbake til hovedoversikt
            </Button>
          )}
          <Link href="/items">
            <AccessibleButton aria-label="Legg til ny gjenstand" className="cta-button">
              <Plus className="w-4 h-4 mr-2" />
              Legg til gjenstand
            </AccessibleButton>
          </Link>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button variant="ghost" size="sm" onClick={resetToRoot}>
            <Home className="w-4 h-4" />
          </Button>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateToBreadcrumb(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                {crumb.name}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totale gjenstander
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                currentLocationId ? currentLocationItems.length : totalItems
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentLocationId ? 'gjenstander på denne lokasjonen' : 'gjenstander totalt'}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lokasjoner
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                currentLocationId ? currentLocationChildren.length : totalLocations
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentLocationId ? 'underlokasjoner' : 'lokasjoner totalt'}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              QR-koder
            </CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                totalQRCodes
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              QR-koder tilgjengelig
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Denne måneden
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                thisMonthItems
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              nye gjenstander
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
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
            ) : (currentLocationId ? currentLocationChildren : locations).length > 0 ? (
              <div className="space-y-3">
                {(currentLocationId ? currentLocationChildren : locations).map((location: Location) => (
                  <div 
                    key={location.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigateToLocation(location)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getLocationIcon(location.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{location.name}</h3>
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
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {currentLocationId ? 'Ingen underlokasjoner' : 'Ingen lokasjoner'}
                </p>
                <p className="text-sm">
                  {currentLocationId 
                    ? 'Denne lokasjonen har ingen underlokasjoner'
                    : 'Opprett dine første lokasjoner for å komme i gang'
                  }
                </p>
                {!currentLocationId && (
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
            ) : (currentLocationId ? currentLocationItems : items).length > 0 ? (
              <div className="space-y-3">
                {(currentLocationId ? currentLocationItems : items).slice(0, 10).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm">
                        {item.category?.icon || '📦'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1">{item.name}</h3>
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
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {(currentLocationId ? currentLocationItems : items).length > 10 && (
                  <div className="text-center pt-4">
                    <Link href={currentLocationId ? `/items?location=${currentLocationId}` : '/items'}>
                      <Button variant="outline">
                        Vis alle gjenstander
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {currentLocationId ? 'Ingen gjenstander på denne lokasjonen' : 'Ingen gjenstander'}
                </p>
                <p className="text-sm">
                  {currentLocationId 
                    ? 'Denne lokasjonen har ingen gjenstander'
                    : 'Legg til dine første gjenstander for å komme i gang'
                  }
                </p>
                <Button asChild className="mt-4">
                  <Link href="/items">
                    <Plus className="w-4 h-4 mr-2" />
                    Legg til gjenstand
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications Summary */}
      <NotificationSummary className="mt-8" />

      {/* Recent Activities */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Nylige aktiviteter</CardTitle>
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
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
  )
}
