'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  CloudOff,
  Signal,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  MapPin,
  Activity
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { offlineManager } from '@/lib/offline/offline-manager'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [offlineStats, setOfflineStats] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [lastChecked, setLastChecked] = useState(new Date())
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we're in the browser
    setIsClient(true)
    
    // Only proceed if we're in the browser
    if (typeof window !== 'undefined') {
      // Check initial online status
      setIsOnline(navigator.onLine)
      loadOfflineStats()

      // Set up online/offline listeners
      const handleOnline = () => {
        setIsOnline(true)
        setRetryCount(0)
        // Automatically redirect when back online
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }

      const handleOffline = () => {
        setIsOnline(false)
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [router])

  const loadOfflineStats = async () => {
    try {
      const stats = await offlineManager.getOfflineStats()
      setOfflineStats(stats)
      setLastChecked(new Date())
    } catch (error) {
      console.error('Failed to load offline stats:', error)
    }
  }

  const checkConnection = async () => {
    setRetryCount(prev => prev + 1)
    setLastChecked(new Date())
    
    if (typeof window !== 'undefined' && navigator.onLine) {
      try {
        // Try to fetch a small resource to verify actual connectivity
        const response = await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-cache' 
        })
        
        if (response.ok) {
          setIsOnline(true)
          setTimeout(() => {
            router.push('/dashboard')
          }, 500)
        }
      } catch (error) {
        console.error('Connection test failed:', error)
      }
    }
  }

  const syncOfflineData = async () => {
    try {
      await offlineManager.syncOfflineActions()
      await loadOfflineStats()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  const getConnectionAdvice = () => {
    const tips = [
      'Sjekk at WiFi eller mobildata er påslått',
      'Prøv å flytte deg nærmere WiFi-ruteren',
      'Sjekk om andre apper kan koble til internett',
      'Restart WiFi eller skru mobildata av og på igjen',
      'Kontakt internettleverandøren din hvis problemet vedvarer'
    ]
    
    return tips[retryCount % tips.length]
  }

  // Don't render anything until we're sure we're in the browser
  if (!isClient) {
    return (
      <div className="page cq min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Laster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page cq min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Offline Card */}
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              {isOnline ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <WifiOff className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <CardTitle className="text-xl">
              {isOnline ? 'Tilkobling gjenopprettet!' : 'Du er offline'}
            </CardTitle>
            <CardDescription>
              {isOnline 
                ? 'Omdirigerer deg tilbake til appen...'
                : 'Sjekk internetttilkoblingen din og prøv igjen'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2">
              <Badge variant={isOnline ? "default" : "destructive"}>
                <Signal className="w-3 h-3 mr-1" />
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Sjekket: {lastChecked.toLocaleTimeString('nb-NO')}
              </Badge>
            </div>

            {/* Retry Button */}
            <Button 
              onClick={checkConnection} 
              className="w-full"
              disabled={isOnline}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isOnline ? 'Tilkoblet' : 'Prøv igjen'}
            </Button>

            {/* Connection Advice */}
            {!isOnline && retryCount > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>Tips:</strong> {getConnectionAdvice()}
              </div>
            )}

            {/* Try Count */}
            {retryCount > 0 && !isOnline && (
              <p className="text-sm text-muted-foreground">
                Forsøk {retryCount} • Ikke gi opp!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Offline Data Status */}
        {offlineStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CloudOff className="w-5 h-5" />
                Offline Data
              </CardTitle>
              <CardDescription>
                Data tilgjengelig mens du er offline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Gjenstander</span>
                  </div>
                  <p className="text-lg font-bold">{offlineStats.totalCachedItems}</p>
                  <p className="text-xs text-muted-foreground">lagret lokalt</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Ventende</span>
                  </div>
                  <p className="text-lg font-bold">{offlineStats.pendingActions}</p>
                  <p className="text-xs text-muted-foreground">handlinger</p>
                </div>
              </div>

              {offlineStats.pendingActions > 0 && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={syncOfflineData}
                    className="w-full"
                    disabled={!isOnline}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Synkroniser data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Offline Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tilgjengelig offline</CardTitle>
            <CardDescription>
              Disse funksjonene fungerer uten internett
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Se lagrede gjenstander</p>
                  <p className="text-xs text-muted-foreground">Bla gjennom ditt lokale inventar</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Se lokasjoner</p>
                  <p className="text-xs text-muted-foreground">Finn hvor ting er oppbevart</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Activity className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Legg til nye gjenstander</p>
                  <p className="text-xs text-muted-foreground">Lagres lokalt og synkroniseres senere</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/items">
              <Package className="w-4 h-4 mr-2" />
              Gjenstander
            </Link>
          </Button>
        </div>

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Hjemmeinventar fungerer offline med intelligent caching</p>
          <p className="mt-1">Dine endringer synkroniseres automatisk når tilkoblingen er tilbake</p>
        </div>
      </div>
    </div>
  )
}
