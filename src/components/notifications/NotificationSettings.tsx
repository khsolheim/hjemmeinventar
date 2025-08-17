'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bell, 
  BellOff, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  Smartphone,
  Shield
} from 'lucide-react'
import { usePushNotifications } from '@/lib/notifications/push-service'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export function NotificationSettings() {
  const { data: session } = useSession()
  const {
    permission,
    isSubscribed,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications(session?.user?.id)

  const [settings, setSettings] = useState({
    expiryReminders: true,
    loanReminders: true,
    lowStockAlerts: true,
    generalNotifications: true,
    dailyDigest: false
  })

  const [isLoading, setIsLoading] = useState(false)

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'Tillatt',
          variant: 'default' as const,
          color: 'text-green-700'
        }
      case 'denied':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          text: 'Nektet',
          variant: 'destructive' as const,
          color: 'text-red-700'
        }
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
          text: 'Ikke forespurt',
          variant: 'secondary' as const,
          color: 'text-orange-700'
        }
    }
  }

  const handleEnableNotifications = async () => {
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setIsLoading(true)
    try {
      const success = await unsubscribe()
      if (success) {
        toast.success('Push notifications deaktivert')
      } else {
        toast.error('Kunne ikke deaktivere push notifications')
      }
    } catch (error) {
      toast.error('Feil ved deaktivering av notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      await sendTestNotification()
      toast.success('Test notification sendt!')
    } catch (error) {
      toast.error('Kunne ikke sende test notification')
    }
  }

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))
    
    // In a real app, save to backend
    console.log('Notification setting changed:', setting, value)
    toast.success('Innstilling oppdatert')
  }

  const permissionStatus = getPermissionStatus()

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Push notifications støttes ikke i din nettleser. For beste opplevelse, 
              bruk en moderne nettleser som Chrome, Firefox eller Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Administrer varsler og påminnelser for HMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {permissionStatus.icon}
              <div>
                <div className="font-medium">Tillatelse status</div>
                <div className={`text-sm ${permissionStatus.color}`}>
                  {permissionStatus.text}
                </div>
              </div>
            </div>
            <Badge variant={permissionStatus.variant}>
              {permissionStatus.text}
            </Badge>
          </div>

          {/* Subscription Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4" />
              <div>
                <div className="font-medium">Abonnement status</div>
                <div className="text-sm text-gray-600">
                  {isSubscribed ? 'Aktiv' : 'Ikke aktiv'}
                </div>
              </div>
            </div>
            <Badge variant={isSubscribed ? 'default' : 'secondary'}>
              {isSubscribed ? 'Aktivt' : 'Inaktivt'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {permission === 'granted' && !isSubscribed && (
              <Button onClick={handleEnableNotifications} disabled={isLoading}>
                <Bell className="w-4 h-4 mr-2" />
                Aktiver varsler
              </Button>
            )}

            {permission !== 'granted' && (
              <Button onClick={handleEnableNotifications} disabled={isLoading}>
                <Shield className="w-4 h-4 mr-2" />
                Be om tillatelse
              </Button>
            )}

            {isSubscribed && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDisableNotifications} 
                  disabled={isLoading}
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  Deaktiver varsler
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestNotification}
                >
                  Test varsel
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          {permission === 'denied' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Push notifications er blokkert. For å aktivere dem, klikk på lås-ikonet 
                i adresselinjen og velg "Tillat" for notifications.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Varselpreferanser
            </CardTitle>
            <CardDescription>
              Velg hvilke typer varsler du vil motta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="expiry-reminders" className="text-base">
                    Utløpsdato påminnelser
                  </Label>
                  <div className="text-sm text-gray-600">
                    Få varsler når produkter nærmer seg utløpsdato
                  </div>
                </div>
                <Switch
                  id="expiry-reminders"
                  checked={settings.expiryReminders}
                  onCheckedChange={(checked) => 
                    handleSettingChange('expiryReminders', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="loan-reminders" className="text-base">
                    Utlån påminnelser
                  </Label>
                  <div className="text-sm text-gray-600">
                    Få varsler om forsinkede eller snart forfallende utlån
                  </div>
                </div>
                <Switch
                  id="loan-reminders"
                  checked={settings.loanReminders}
                  onCheckedChange={(checked) => 
                    handleSettingChange('loanReminders', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="low-stock" className="text-base">
                    Lavt lager varsler
                  </Label>
                  <div className="text-sm text-gray-600">
                    Få varsler når gjenstander går tom
                  </div>
                </div>
                <Switch
                  id="low-stock"
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) => 
                    handleSettingChange('lowStockAlerts', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="general" className="text-base">
                    Generelle varsler
                  </Label>
                  <div className="text-sm text-gray-600">
                    Få varsler om app-oppdateringer og tips
                  </div>
                </div>
                <Switch
                  id="general"
                  checked={settings.generalNotifications}
                  onCheckedChange={(checked) => 
                    handleSettingChange('generalNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-digest" className="text-base">
                    Daglig sammendrag
                  </Label>
                  <div className="text-sm text-gray-600">
                    Få et daglig sammendrag av aktiviteter
                  </div>
                </div>
                <Switch
                  id="daily-digest"
                  checked={settings.dailyDigest}
                  onCheckedChange={(checked) => 
                    handleSettingChange('dailyDigest', checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
