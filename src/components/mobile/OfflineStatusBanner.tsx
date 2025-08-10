'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff,
  RotateCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium
} from 'lucide-react'
import { offlineManager } from '@/lib/offline/offline-manager'
import { cn } from '@/lib/utils'

interface OfflineStatusBannerProps {
  showDetailedStats?: boolean
  compact?: boolean
  className?: string
}

interface OfflineStats {
  totalCachedItems: number
  pendingActions: number
  failedActions: number
  cacheSize: string
  lastSync: Date | null
}

export function OfflineStatusBanner({ 
  showDetailedStats = false, 
  compact = false,
  className 
}: OfflineStatusBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('offline')
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())

  // Network status monitoring
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      setLastUpdateTime(new Date())
      
      if (navigator.onLine) {
        measureConnectionQuality()
      } else {
        setConnectionQuality('offline')
      }
    }

    // Network connection info
    const updateConnectionInfo = () => {
      // @ts-ignore - navigator.connection is experimental
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown')
      }
    }

    // Event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // @ts-ignore
    if (navigator.connection) {
      // @ts-ignore
      navigator.connection.addEventListener('change', updateConnectionInfo)
    }

    // Initial check
    updateOnlineStatus()
    updateConnectionInfo()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      
      // @ts-ignore
      if (navigator.connection) {
        // @ts-ignore
        navigator.connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [])

  // Load offline stats
  useEffect(() => {
    if (showDetailedStats) {
      loadOfflineStats()
      
      // Update stats every 30 seconds
      const interval = setInterval(loadOfflineStats, 30000)
      return () => clearInterval(interval)
    }
  }, [showDetailedStats])

  const loadOfflineStats = async () => {
    try {
      const stats = await offlineManager.getOfflineStats()
      setOfflineStats(stats)
    } catch (error) {
      console.error('Failed to load offline stats:', error)
    }
  }

  const measureConnectionQuality = async () => {
    if (!navigator.onLine) {
      setConnectionQuality('offline')
      return
    }

    try {
      const start = performance.now()
      const response = await fetch('/api/ping?t=' + Date.now(), { 
        method: 'GET',
        cache: 'no-cache'
      })
      const end = performance.now()
      const latency = end - start

      if (response.ok) {
        if (latency < 100) {
          setConnectionQuality('excellent')
        } else if (latency < 300) {
          setConnectionQuality('good')
        } else {
          setConnectionQuality('poor')
        }
      } else {
        setConnectionQuality('poor')
      }
    } catch (error) {
      setConnectionQuality('poor')
    }
  }

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-500" />
    
    switch (connectionQuality) {
      case 'excellent':
        return <SignalHigh className="w-4 h-4 text-green-500" />
      case 'good':
        return <SignalMedium className="w-4 h-4 text-yellow-500" />
      case 'poor':
        return <SignalLow className="w-4 h-4 text-orange-500" />
      default:
        return <Signal className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    
    switch (connectionQuality) {
      case 'excellent':
        return 'Utmerket tilkobling'
      case 'good':
        return 'God tilkobling'
      case 'poor':
        return 'Treg tilkobling'
      default:
        return 'Online'
    }
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-100 border-red-200 text-red-800'
    
    switch (connectionQuality) {
      case 'excellent':
        return 'bg-green-100 border-green-200 text-green-800'
      case 'good':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      case 'poor':
        return 'bg-orange-100 border-orange-200 text-orange-800'
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800'
    }
  }

  const triggerSync = async () => {
    try {
      if (navigator.onLine) {
        await offlineManager.syncOfflineActions()
        await loadOfflineStats()
      }
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border', getStatusColor(), className)}>
        {getConnectionIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {offlineStats && offlineStats.pendingActions > 0 && (
          <Badge variant="secondary" className="text-xs">
            {offlineStats.pendingActions} ventende
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('mobile-offline-banner', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getConnectionIcon()}
              <div>
                <h4 className="font-medium">{getStatusText()}</h4>
                <p className="text-sm text-muted-foreground">
                  {connectionType !== 'unknown' && `${connectionType.toUpperCase()} • `}
                  Sist oppdatert {lastUpdateTime.toLocaleTimeString('nb-NO')}
                </p>
              </div>
            </div>
            
            {isOnline && (
              <Button variant="outline" size="sm" onClick={triggerSync}>
                <RotateCw className="w-4 h-4 mr-1" />
                Synkroniser
              </Button>
            )}
          </div>

          {/* Offline Warning */}
          {!isOnline && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Du er offline. Endringer vil bli synkronisert når tilkoblingen er tilbake.
              </AlertDescription>
            </Alert>
          )}

          {/* Pending Actions Warning */}
          {offlineStats && offlineStats.pendingActions > 0 && (
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                {offlineStats.pendingActions} handlinger venter på synkronisering.
              </AlertDescription>
            </Alert>
          )}

          {/* Failed Actions Warning */}
          {offlineStats && offlineStats.failedActions > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {offlineStats.failedActions} handlinger feilet under synkronisering.
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Stats */}
          {showDetailedStats && offlineStats && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full justify-center"
              >
                {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
              </Button>
              
              {isExpanded && (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Lagret data</span>
                    </div>
                    <p className="text-lg font-bold">{offlineStats.totalCachedItems}</p>
                    <p className="text-xs text-muted-foreground">gjenstander</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Cloud className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Cache størrelse</span>
                    </div>
                    <p className="text-lg font-bold">{offlineStats.cacheSize}</p>
                    <p className="text-xs text-muted-foreground">lokalt lagret</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Upload className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Ventende</span>
                    </div>
                    <p className="text-lg font-bold">{offlineStats.pendingActions}</p>
                    <p className="text-xs text-muted-foreground">handlinger</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Siste sync</span>
                    </div>
                    <p className="text-sm font-bold">
                      {offlineStats.lastSync 
                        ? offlineStats.lastSync.toLocaleTimeString('nb-NO')
                        : 'Aldri'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {offlineStats.lastSync 
                        ? offlineStats.lastSync.toLocaleDateString('nb-NO')
                        : 'Ikke synkronisert'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={measureConnectionQuality}
              disabled={!isOnline}
            >
              Test tilkobling
            </Button>
            
            {showDetailedStats && (
              <Button variant="outline" size="sm" onClick={loadOfflineStats}>
                Oppdater statistikk
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for using offline status in components
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('offline')

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return {
    isOnline,
    connectionQuality,
    canSync: isOnline && connectionQuality !== 'offline'
  }
}
