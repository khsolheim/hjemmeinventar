'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOfflineService } from '@/lib/offline-service'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  Cloud,
  CloudOff
} from 'lucide-react'

export function OfflineStatus() {
  const { isOffline, queueLength, forceSync, queueItems } = useOfflineService()
  const [showDetails, setShowDetails] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      await forceSync()
    } finally {
      setSyncing(false)
    }
  }

  if (!isOffline && queueLength === 0) {
    return null // Don't show anything if online and no pending changes
  }

  return (
    <Card className={`border-2 ${isOffline ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOffline ? (
              <WifiOff className="w-5 h-5 text-orange-600" />
            ) : (
              <Wifi className="w-5 h-5 text-blue-600" />
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  {isOffline ? 'Offline modus' : 'Online - venter på synkronisering'}
                </h3>
                {queueLength > 0 && (
                  <Badge variant={isOffline ? "secondary" : "default"}>
                    {queueLength} endringer
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isOffline
                  ? 'Endringer lagres lokalt og synkroniseres når du er online'
                  : 'Synkroniserer ventende endringer...'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOffline && queueLength > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="gap-2"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
                Synkroniser
              </Button>
            )}

            {queueLength > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Skjul' : 'Vis'} detaljer
              </Button>
            )}
          </div>
        </div>

        {/* Queue Details */}
        {showDetails && queueLength > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Ventende endringer ({queueLength})
            </h4>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {queueItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-white/50 rounded">
                  <div className="flex-shrink-0">
                    {item.type === 'create' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {item.type === 'update' && <RefreshCw className="w-4 h-4 text-blue-600" />}
                    {item.type === 'delete' && <AlertCircle className="w-4 h-4 text-red-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium capitalize">
                      {item.type} {item.endpoint.split('/').pop()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString('no-NO')}
                    </div>
                  </div>

                  {item.retries > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.retries} forsøk
                    </Badge>
                  )}
                </div>
              ))}

              {queueItems.length > 5 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  +{queueItems.length - 5} flere endringer...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Offline Tips */}
        {isOffline && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CloudOff className="w-4 h-4" />
              Offline tips
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Du kan fortsatt legge til og redigere gjenstander</li>
              <li>• QR-skanning fungerer når du er offline</li>
              <li>• Endringer synkroniseres automatisk når du er online</li>
              <li>• Sjekk nettverksinnstillinger hvis problemet vedvarer</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for mobile/header
export function OfflineStatusCompact() {
  const { isOffline, queueLength } = useOfflineService()

  if (!isOffline && queueLength === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
      isOffline ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
    }`}>
      {isOffline ? (
        <WifiOff className="w-4 h-4" />
      ) : (
        <Wifi className="w-4 h-4" />
      )}

      <span>
        {isOffline ? 'Offline' : `${queueLength} venter`}
      </span>

      {queueLength > 0 && !isOffline && (
        <Badge variant="secondary" className="text-xs">
          {queueLength}
        </Badge>
      )}
    </div>
  )
}

// Hook for components that need offline awareness
export function useOfflineAware() {
  const { isOffline, addToQueue } = useOfflineService()

  const offlineAwareMutation = async (
    operation: () => Promise<any>,
    queueData: { type: 'create' | 'update' | 'delete', data: any, endpoint: string }
  ) => {
    if (isOffline) {
      // Add to offline queue
      await addToQueue(queueData.type, queueData.data, queueData.endpoint)
      return { success: true, offline: true }
    } else {
      // Execute immediately
      return await operation()
    }
  }

  return { offlineAwareMutation, isOffline }
}
