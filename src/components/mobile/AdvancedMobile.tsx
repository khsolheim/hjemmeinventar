'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Smartphone,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Download,
  Upload,
  Sync,
  Battery,
  Signal,
  Camera,
  Microphone,
  Location,
  Bluetooth,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles,
  Smartphone as Mobile,
  Wifi as Network,
  WifiOff as Offline,
  Bell as Notification,
  BellOff as Silent,
  Download as Get,
  Upload as Send,
  Sync as Update,
  Battery as Power,
  Signal as Connection,
  Camera as Photo,
  Microphone as Voice,
  Location as GPS,
  Bluetooth as BT,
  Settings as Config,
  RefreshCw as Reload,
  CheckCircle as Success,
  XCircle as Error,
  AlertTriangle as Warning,
  Info as Details,
  Star as Favorite,
  Award as Prize,
  Trophy as Victory,
  Crown as King,
  Rocket as Launch,
  Sparkles as Magic,
  Smartphone as Phone,
  Wifi as Internet,
  WifiOff as Disconnected,
  Bell as Alert,
  BellOff as Mute,
  Download as Save,
  Upload as Share,
  Sync as Synchronize,
  Battery as Energy,
  Signal as Strength,
  Camera as Capture,
  Microphone as Audio,
  Location as Map,
  Bluetooth as Wireless,
  Settings as Setup,
  RefreshCw as Restart,
  CheckCircle as Done,
  XCircle as Fail,
  AlertTriangle as Notice,
  Info as Help,
  Star as Rate,
  Award as Win,
  Trophy as Success,
  Crown as Leader,
  Rocket as Boost,
  Sparkles as Shine
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedMobileProps {
  className?: string
}

export function AdvancedMobile({ className }: AdvancedMobileProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'offline' | 'notifications' | 'optimization'>('overview')
  const [isOnline, setIsOnline] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const haptic = useHapticFeedback()

  // Mobile queries
  const mobileQuery = trpc.mobile.getMobileStatus.useQuery()
  const offlineQuery = trpc.mobile.getOfflineData.useQuery()
  const notificationsQuery = trpc.mobile.getNotifications.useQuery()
  const optimizationQuery = trpc.mobile.getOptimizationStatus.useQuery()

  const syncDataMutation = trpc.mobile.syncData.useMutation()
  const toggleNotificationsMutation = trpc.mobile.toggleNotifications.useMutation()
  const optimizeMobileMutation = trpc.mobile.optimizeMobile.useMutation()

  const handleSyncData = async () => {
    haptic.success()
    try {
      await syncDataMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to sync data:', error)
    }
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    haptic.light()
    try {
      await toggleNotificationsMutation.mutateAsync({ enabled })
      setNotificationsEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
    }
  }

  const handleOptimizeMobile = async () => {
    haptic.selection()
    try {
      await optimizeMobileMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to optimize mobile:', error)
    }
  }

  const getConnectionStatus = (status: string) => {
    switch (status) {
      case 'online': return { color: 'text-green-600', label: 'Online', icon: Wifi }
      case 'offline': return { color: 'text-red-600', label: 'Offline', icon: WifiOff }
      case 'syncing': return { color: 'text-yellow-600', label: 'Synkroniserer', icon: Sync }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  const getBatteryLevel = (level: number) => {
    if (level >= 80) return { color: 'text-green-600', icon: Battery }
    if (level >= 50) return { color: 'text-yellow-600', icon: Battery }
    return { color: 'text-red-600', icon: Battery }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Mobile</h2>
          <p className="text-muted-foreground">
            Offline capabilities, push notifications og mobile optimalisering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            Mobile First
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            Offline Ready
          </Badge>
        </div>
      </div>

      {/* Mobile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mobileQuery.data?.connectionStatus || 'Online'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getConnectionStatus(mobileQuery.data?.connectionStatus || 'online').label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Data</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {offlineQuery.data?.offlineItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Synced items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {notificationsQuery.data?.activeNotifications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Rocket className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {optimizationQuery.data?.performanceScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Mobile score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('overview')}
          className="flex-1"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Oversikt
        </Button>
        <Button
          variant={selectedTab === 'offline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('offline')}
          className="flex-1"
        >
          <WifiOff className="w-4 h-4 mr-2" />
          Offline
        </Button>
        <Button
          variant={selectedTab === 'notifications' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('notifications')}
          className="flex-1"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </Button>
        <Button
          variant={selectedTab === 'optimization' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('optimization')}
          className="flex-1"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Optimization
        </Button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mobileQuery.data?.deviceStatus?.map((status) => {
                    const battery = getBatteryLevel(status.batteryLevel)
                    const BatteryIcon = battery.icon
                    
                    return (
                      <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-8 h-8 text-blue-600" />
                          <div>
                            <div className="font-medium">{status.deviceName}</div>
                            <div className="text-sm text-muted-foreground">
                              {status.os} • {status.version}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium">{status.batteryLevel}%</div>
                            <div className="text-xs text-muted-foreground">
                              {status.signalStrength} bars
                            </div>
                          </div>
                          
                          <BatteryIcon className={`w-5 h-5 ${battery.color}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Connection Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Connection Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mobileQuery.data?.connectionInfo?.map((info) => (
                    <div key={info.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{info.name}</span>
                        <span className="text-sm font-medium">{info.value}</span>
                      </div>
                      <Progress value={info.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Offline Tab */}
      {selectedTab === 'offline' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WifiOff className="w-5 h-5" />
                Offline Capabilities
              </CardTitle>
              <CardDescription>
                Offline data sync og caching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offlineQuery.data?.offlineData?.map((data) => (
                  <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Download className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{data.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.size} • {data.lastSync}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{data.syncStatus}</div>
                        <div className="text-xs text-muted-foreground">
                          {data.items} items
                        </div>
                      </div>
                      
                      <Badge variant={data.isSynced ? 'default' : 'secondary'}>
                        {data.isSynced ? 'Synced' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sync Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sync className="w-5 h-5" />
                Sync Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={handleSyncData}>
                  <Sync className="w-5 h-5" />
                  <span className="text-sm">Sync All</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Download</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Upload</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm">Refresh</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {selectedTab === 'notifications' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Push notifications og alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationsQuery.data?.notifications?.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Bell className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {notification.message}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{notification.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </div>
                      </div>
                      
                      <Badge variant={notification.isRead ? 'secondary' : 'default'}>
                        {notification.isRead ? 'Read' : 'New'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationsQuery.data?.settings?.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <setting.icon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{setting.name}</span>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => handleToggleNotifications(enabled)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Optimization Tab */}
      {selectedTab === 'optimization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationQuery.data?.metrics?.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                      <Progress value={metric.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizationQuery.data?.recommendations?.map((recommendation) => (
                    <div key={recommendation.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{recommendation.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {recommendation.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Optimization Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={handleOptimizeMobile}>
                  <Rocket className="w-5 h-5" />
                  <span className="text-sm">Optimize</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm">Clear Cache</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Update</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Raske handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-sm">Install PWA</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Bell className="w-5 h-5" />
              <span className="text-sm">Test Notifications</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm">Offline Mode</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Rocket className="w-5 h-5" />
              <span className="text-sm">Performance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
