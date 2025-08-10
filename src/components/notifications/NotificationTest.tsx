'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bell, 
  BellOff, 
  TestTube, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Settings,
  Loader2
} from 'lucide-react'
import { usePushNotifications } from '@/lib/notifications/push-service'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Link from 'next/link'

export function NotificationTest() {
  const { data: session } = useSession()
  const {
    permission,
    isSubscribed,
    isSupported,
    requestPermission,
    subscribe,
    sendTestNotification
  } = usePushNotifications(session?.user?.id)

  const [isTesting, setIsTesting] = useState(false)
  const [isEnabling, setIsEnabling] = useState(false)

  const handleEnableNotifications = async () => {
    setIsEnabling(true)
    try {
      const newPermission = await requestPermission()
      
      if (newPermission === 'granted') {
        const subscribeSuccess = await subscribe()
        if (subscribeSuccess) {
          toast.success('Push notifications aktivert!')
        } else {
          toast.error('Kunne ikke aktivere push notifications')
        }
      } else {
        toast.error('Push notifications ble ikke tillatt')
      }
    } catch (error) {
      toast.error('Feil ved aktivering av notifications')
    } finally {
      setIsEnabling(false)
    }
  }

  const handleTestNotification = async () => {
    setIsTesting(true)
    try {
      await sendTestNotification()
      toast.success('Test notification sendt!')
    } catch (error) {
      toast.error('Kunne ikke sende test notification')
    } finally {
      setIsTesting(false)
    }
  }

  const handleTriggerJobs = async () => {
    try {
      const response = await fetch('/api/notifications/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' })
      })

      if (response.ok) {
        toast.success('Notification checks kjørt manuelt')
      } else {
        toast.error('Kunne ikke kjøre notification checks')
      }
    } catch (error) {
      toast.error('Feil ved kjøring av notification jobs')
    }
  }

  const getStatusInfo = () => {
    if (!isSupported) {
      return {
        icon: <XCircle className="h-4 w-4 text-gray-500" />,
        text: 'Ikke støttet',
        variant: 'secondary' as const,
        description: 'Din nettleser støtter ikke push notifications'
      }
    }

    if (permission === 'denied') {
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        text: 'Blokkert',
        variant: 'destructive' as const,
        description: 'Push notifications er blokkert i nettleseren'
      }
    }

    if (permission === 'granted' && isSubscribed) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        text: 'Aktivt',
        variant: 'default' as const,
        description: 'Push notifications er aktivert og fungerer'
      }
    }

    return {
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      text: 'Ikke aktivert',
      variant: 'secondary' as const,
      description: 'Push notifications er ikke aktivert ennå'
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Status og testverktøy for push notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <span className="text-sm font-medium">{statusInfo.text}</span>
          </div>
          <Badge variant={statusInfo.variant}>
            {statusInfo.text}
          </Badge>
        </div>

        <p className="text-xs text-gray-600">
          {statusInfo.description}
        </p>

        {/* Actions */}
        <div className="space-y-2">
          {!isSupported && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                For å bruke push notifications, oppgrader til en moderne nettleser.
              </AlertDescription>
            </Alert>
          )}

          {isSupported && permission !== 'granted' && (
            <Button 
              size="sm" 
              onClick={handleEnableNotifications} 
              disabled={isEnabling}
              className="w-full"
            >
              {isEnabling ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                  Aktiverer...
                </>
              ) : (
                <>
                  <Bell className="w-3 h-3 mr-2" />
                  Aktiver varsler
                </>
              )}
            </Button>
          )}

          {isSubscribed && (
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleTestNotification} 
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    Sender...
                  </>
                ) : (
                  <>
                    <TestTube className="w-3 h-3 mr-2" />
                    Send test
                  </>
                )}
              </Button>

              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleTriggerJobs}
                className="w-full"
              >
                <Bell className="w-3 h-3 mr-2" />
                Kjør varslingsjobber
              </Button>
            </div>
          )}

          <Button size="sm" variant="ghost" asChild className="w-full">
            <Link href="/settings">
              <Settings className="w-3 h-3 mr-2" />
              Alle innstillinger
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
