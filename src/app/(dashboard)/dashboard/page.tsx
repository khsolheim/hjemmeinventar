'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Plus, Package, MapPin, Search, QrCode, TrendingUp, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { NotificationSummary } from '@/components/notifications/NotificationCenter'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { NotificationTest } from '@/components/notifications/NotificationTest'

export default function DashboardPage() {
  // Fetch dashboard data with error handling
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = trpc.items.getAll.useQuery({ limit: 10 })
  const { data: locations = [], isLoading: locationsLoading, error: locationsError } = trpc.locations.getAll.useQuery()
  const { data: activities = [], isLoading: activitiesLoading, error: activitiesError } = trpc.activities.getRecent.useQuery({ limit: 5 })

  const isLoading = itemsLoading || locationsLoading
  const hasErrors = itemsError || locationsError || activitiesError

  // Check if user needs to login (auth error)
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
  const totalQRCodes = locations.length // Each location has a QR code
  const thisMonthItems = items.filter(item => {
    const createdDate = new Date(item.createdAt)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
  }).length

  // Check if onboarding is completed
  // Create a flat list of all locations including children
  const allLocations = locations.reduce((acc: any[], location: any) => {
    acc.push(location)
    if (location.children) {
      const flattenChildren = (children: any[]): any[] => {
        return children.reduce((childAcc: any[], child: any) => {
          childAcc.push(child)
          if (child.children) {
            childAcc.push(...flattenChildren(child.children))
          }
          return childAcc
        }, [])
      }
      acc.push(...flattenChildren(location.children))
    }
    return acc
  }, [])

  const hasRooms = allLocations.some(location => location.type === 'ROOM')
  const hasStorageLocations = allLocations.some(location => location.type !== 'ROOM')
  const hasItems = totalItems > 0
  const isOnboardingCompleted = hasRooms && hasStorageLocations && hasItems

  // Debug: Console log for troubleshooting (remove in production)
  if (typeof window !== 'undefined') {
    console.log('Dashboard Debug:', {
      totalLocations: locations.length,
      allLocationsCount: allLocations.length,
      locationTypes: allLocations.map(loc => ({ name: loc.name, type: loc.type })),
      hasRooms,
      hasStorageLocations,
      hasItems,
      isOnboardingCompleted
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
            Velkommen tilbake! Her er en oversikt over inventaret ditt.
          </p>
        </div>
        <Link href="/items">
          <AccessibleButton aria-label="Legg til ny gjenstand">
            <Plus className="w-4 h-4 mr-2" />
            Legg til gjenstand
          </AccessibleButton>
        </Link>
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
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
                totalItems
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalItems === 0 
                ? 'Start med å legge til dine første gjenstander'
                : `${totalItems} gjenstander registrert`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
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
                totalLocations
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalLocations === 0 
                ? 'Opprett rom og oppbevaringssteder'
                : `${totalLocations} lokasjoner opprettet`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              QR-koder generert
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
              {totalQRCodes === 0 
                ? 'QR-etiketter for enkel skanning'
                : `${totalQRCodes} QR-koder tilgjengelig`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
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
              {thisMonthItems === 0 
                ? 'Gjenstander lagt til'
                : `${thisMonthItems} nye gjenstander`
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Summary */}
      <NotificationSummary className="mb-8" />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {!isOnboardingCompleted && (
          <Card>
            <CardHeader>
              <CardTitle>Kom i gang</CardTitle>
              <CardDescription>
                Sett opp ditt første inventar på noen enkle steg
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  hasRooms ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'
                }`}>
                  {hasRooms ? '✓' : '1'}
                </div>
                <div>
                  <h3 className="font-medium">Opprett ditt første rom</h3>
                  <p className="text-sm text-muted-foreground">
                    Start med å lage rom som kjøkken, soverom eller bod
                  </p>
                </div>
                {!hasRooms && (
                  <Link href="/locations">
                    <Button variant="outline" size="sm">
                      Opprett rom
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  hasStorageLocations ? 'bg-green-500 text-white' : hasRooms ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {hasStorageLocations ? '✓' : '2'}
                </div>
                <div>
                  <h3 className="font-medium">Legg til oppbevaringssteder</h3>
                  <p className="text-sm text-muted-foreground">
                    Lag hyller, bokser og skuffer i rommene dine
                  </p>
                </div>
                {!hasStorageLocations && hasRooms && (
                  <Link href="/locations">
                    <Button variant="outline" size="sm">
                      Legg til hyller
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  hasItems ? 'bg-green-500 text-white' : hasStorageLocations ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {hasItems ? '✓' : '3'}
                </div>
                <div>
                  <h3 className="font-medium">Registrer dine første gjenstander</h3>
                  <p className="text-sm text-muted-foreground">
                    Ta bilder og legg til beskrivelser av tingene dine
                  </p>
                </div>
                {!hasItems && hasStorageLocations && (
                  <Link href="/items">
                    <Button variant="outline" size="sm">
                      Legg til gjenstander
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
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
                  <div key={activity.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
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

        {/* Recent Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Nylig lagt til</CardTitle>
              <CardDescription>
                Dine sist registrerte gjenstander
              </CardDescription>
            </div>
            <Link href="/items">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Søk i inventar
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Laster gjenstander...</span>
              </div>
            ) : items.length > 0 ? (
              <div className="space-y-3">
                {items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm">
                        {item.category?.icon || '📦'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.description || 'Ingen beskrivelse'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {item.availableQuantity} {item.unit}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {item.location.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('no-NO', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ingen gjenstander ennå</p>
                <p className="text-sm">
                  Gjenstander vil vises her når du legger dem til
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
