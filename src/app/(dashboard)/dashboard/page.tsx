'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Plus, Package, MapPin, Search, QrCode, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { NotificationSummary } from '@/components/notifications/NotificationCenter'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { NotificationTest } from '@/components/notifications/NotificationTest'
import { QuickAddModal } from '@/components/ui/quick-add-modal'
import { PersonalizedDashboard } from '@/components/dashboard/PersonalizedDashboard'
import { DashboardSkeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  // Quick Add Modal state
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [defaultLocationId, setDefaultLocationId] = useState<string>()

  // Dashboard mode state
  const [dashboardMode, setDashboardMode] = useState<'standard' | 'personalized'>('standard')

  // Load dashboard preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('hms-dashboard-mode')
    if (savedMode === 'personalized') {
      setDashboardMode('personalized')
    }
  }, [])

  // Save dashboard preference
  const toggleDashboardMode = (mode: 'standard' | 'personalized') => {
    setDashboardMode(mode)
    localStorage.setItem('hms-dashboard-mode', mode)
  }

  // Fetch dashboard data with error handling
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = trpc.items.getAll.useQuery({ limit: 10 })
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = trpc.locations.getAll.useQuery()
  // ACTIVITIES COMPLETELY REMOVED - Replace with simple stats
  // No more activities query - this was causing persistent React rendering issues
  
  // Ensure data is always arrays
  const locations = locationsData && Array.isArray(locationsData) ? locationsData : []
  const items = itemsData?.items && Array.isArray(itemsData.items) ? itemsData.items : []

  // Check if any data is still loading
  const isAnyLoading = itemsLoading || locationsLoading

  const isLoading = itemsLoading || locationsLoading
  const hasErrors = itemsError || locationsError

  // Check if user needs to login (auth error) - safer error checking
  const needsAuth = (itemsError?.data?.code === 'UNAUTHORIZED') || 
                   (locationsError?.data?.code === 'UNAUTHORIZED')

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

  // Calculate stats (using items already defined above)
  const totalItems = items.length
  const totalLocations = locations.length
  const totalQRCodes = locations.length // Each location has a QR code
  const thisMonthItems = items.filter((item: any) => {
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
      <div className="flex justify-between items-center mb-8 cq">
        <div>
          <h1 className="text-3xl font-bold title">Dashboard</h1>
          <p className="text-muted-foreground secondary-text">
            Velkommen tilbake! Her er en oversikt over inventaret ditt.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Dashboard Mode Toggle */}
          <div className="flex rounded-lg border bg-muted p-1">
            <Button
              variant={dashboardMode === 'standard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => toggleDashboardMode('standard')}
              className="px-3 py-1 text-xs"
            >
              Standard
            </Button>
            <Button
              variant={dashboardMode === 'personalized' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => toggleDashboardMode('personalized')}
              className="px-3 py-1 text-xs"
            >
              Personalisert
            </Button>
          </div>
          <AccessibleButton
            aria-label="Legg til ny gjenstand"
            className="cta-button"
            onClick={() => setShowQuickAdd(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Hurtig tillegg
          </AccessibleButton>
        </div>
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Render Dashboard based on mode */}
      {dashboardMode === 'personalized' ? (
        <PersonalizedDashboard />
      ) : (
        <>
          {/* Show skeleton while loading */}
          {isAnyLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Quick Stats */}
              <div className="cq-grid dashboard-grid gap-6 mb-8" style={{"--card-min":"220px"} as any}>
                <Card className="stat-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium title">
                      Totale gjenstander
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="min-h-[84px]">
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

                <Card className="stat-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium title">
                      Lokasjoner
                    </CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="min-h-[84px]">
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

                <Card className="stat-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium title">
                      QR-koder generert
                    </CardTitle>
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="min-h-[84px]">
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

                <Card className="stat-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium title">
                      Denne måneden
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="min-h-[84px]">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 cq">
                <Card>
                  <CardHeader>
                    <CardTitle className="title">Kom i gang</CardTitle>
                    <CardDescription>
                      Sett opp ditt første inventar på noen enkle steg
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 min-h-[240px]">
                    {isOnboardingCompleted ? (
                      <div className="text-sm text-muted-foreground">
                        Alt er klart! Du har rom, oppbevaringssteder og gjenstander.
                      </div>
                    ) : (
                      <>
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
                    <Button variant="outline" size="sm" className="cta-button">
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
                    <Button variant="outline" size="sm" className="cta-button">
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
                    <Button variant="outline" size="sm" className="cta-button">
                      Legg til gjenstander
                    </Button>
                  </Link>
                )}
              </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="title">Systemstatistikk</CardTitle>
            <CardDescription>
              Oversikt over ditt inventar
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[240px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{items.length}</div>
                <div className="text-sm text-muted-foreground">Totalt gjenstander</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{locations.length}</div>
                <div className="text-sm text-muted-foreground">Lokasjoner</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {items.reduce((sum: number, item: any) => sum + (item.totalQuantity || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total mengde</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {items.filter((item: any) => item.availableQuantity > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Tilgjengelige</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link href="/items">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Se alle gjenstander
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="title">Nylig lagt til</CardTitle>
              <CardDescription>
                Dine sist registrerte gjenstander
              </CardDescription>
            </div>
            <Link href="/items">
              <Button variant="outline" size="sm" className="cta-button">
                <Search className="w-4 h-4 mr-2" />
                Søk i inventar
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="min-h-[240px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Laster gjenstander...</span>
              </div>
            ) : items.length > 0 ? (
              <div className="space-y-3">
                {items.slice(0, 5).map((item: any) => (
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
      </div>

              {/* Notification Test */}
              <NotificationTest />
            </>
          )}
        </>
      )}

      <QuickAddModal
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        defaultLocationId={defaultLocationId}
        onItemAdded={() => {
          // Refresh dashboard data
          // This will be handled by tRPC invalidation
        }}
      />

      {/* Add missing closing brace for the component function */}
    </div>
  )
}
