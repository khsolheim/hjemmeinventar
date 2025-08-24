'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Bell,
  BellOff,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles,
  Bell as Notification,
  BellOff as Silent,
  MessageSquare as Chat,
  AlertTriangle as Warning,
  Info as Details,
  CheckCircle as Success,
  XCircle as Error,
  Settings as Config,
  RefreshCw as Update,
  Star as Favorite,
  Award as Prize,
  Trophy as Victory,
  Crown as King,
  Rocket as Launch,
  Sparkles as Magic,
  Bell as Alert,
  BellOff as Mute,
  MessageSquare as Message,
  AlertTriangle as Notice,
  Info as Help,
  CheckCircle as Done,
  XCircle as Fail,
  Settings as Setup,
  RefreshCw as Reload,
  Star as Rate,
  Award as Win,
  Trophy as Success,
  Crown as Leader,
  Rocket as Boost,
  Sparkles as Shine,
  Bell as Ring,
  BellOff as Disabled,
  MessageSquare as Text,
  AlertTriangle as Caution,
  Info as Information,
  CheckCircle as Complete,
  XCircle as Cancel,
  Settings as Options,
  RefreshCw as Restart,
  Star as Mark,
  Award as Achieve,
  Trophy as Win,
  Crown as Top,
  Rocket as Fly,
  Sparkles as Glow,
  Clock,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Crosshair,
  Layers,
  Grid3x3,
  List,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Share2,
  Download,
  Upload,
  Mail,
  Phone,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Bluetooth,
  Zap,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Heart,
  HeartOff,
  Bookmark,
  BookmarkOff,
  Tag,
  Hash,
  AtSign,
  Hash as Number,
  AtSign as Mention,
  Hash as Pound,
  AtSign as At,
  Hash as Sharp,
  AtSign as Symbol
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedNotificationsProps {
  className?: string
}

export function AdvancedNotifications({ className }: AdvancedNotificationsProps) {
  const [selectedTab, setSelectedTab] = useState<'notifications' | 'alerts' | 'analytics' | 'settings'>('notifications')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [pushSupported, setPushSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const haptic = useHapticFeedback()

  // Notification queries
  const notificationQuery = trpc.notifications.getNotificationStatus.useQuery()
  const alertsQuery = trpc.notifications.getSmartAlerts.useQuery()
  const analyticsQuery = trpc.notifications.getNotificationAnalytics.useQuery()
  const settingsQuery = trpc.notifications.getNotificationSettings.useQuery()

  const subscribePushMutation = trpc.notifications.subscribePush.useMutation()
  const sendNotificationMutation = trpc.notifications.sendNotification.useMutation()
  const updateSettingsMutation = trpc.notifications.updateSettings.useMutation()

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      setSubscription(existingSubscription)
    } catch (error) {
      console.error('Failed to check subscription:', error)
    }
  }

  const handleSubscribePush = async () => {
    try {
      setIsSubscribing(true)
      haptic.selection()

      const registration = await navigator.serviceWorker.ready
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual VAPID key
      })

      const result = await subscribePushMutation.mutateAsync({
        subscription: JSON.stringify(newSubscription)
      })

      if (result.success) {
        setSubscription(newSubscription)
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      haptic.error()
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleSendNotification = async (type: string) => {
    try {
      haptic.light()
      
      const result = await sendNotificationMutation.mutateAsync({
        type,
        title: `Test ${type} Notification`,
        message: `This is a test ${type} notification`,
        priority: 'normal'
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      haptic.error()
    }
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ notificationsEnabled: enabled })
      setNotificationsEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
    }
  }

  const getNotificationStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Aktiv', icon: Bell }
      case 'inactive': return { color: 'text-red-600', label: 'Inaktiv', icon: BellOff }
      case 'pending': return { color: 'text-yellow-600', label: 'Venter', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Notifications</h2>
          <p className="text-muted-foreground">
            Push notifications, smart alerts og notification analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Push Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Smart Alerts
          </Badge>
        </div>
      </div>

      {/* Notification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Push Status</CardTitle>
            <Bell className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {subscription ? 'Subscribed' : 'Not Subscribed'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getNotificationStatus(subscription ? 'active' : 'inactive').label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {alertsQuery.data?.activeAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Smart alerts active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsQuery.data?.totalDelivered || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Notifications delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsQuery.data?.openRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Notification open rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
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
          variant={selectedTab === 'alerts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('alerts')}
          className="flex-1"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Smart Alerts
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('analytics')}
          className="flex-1"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </Button>
        <Button
          variant={selectedTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('settings')}
          className="flex-1"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Notifications Tab */}
      {selectedTab === 'notifications' && (
        <div className="space-y-4">
          {/* Push Notification Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Configure og test push notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Subscription Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        {subscription ? 'Subscribed to push notifications' : 'Not subscribed to push notifications'}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSubscribePush}
                    disabled={!pushSupported || isSubscribing}
                    variant={subscription ? 'outline' : 'default'}
                  >
                    {isSubscribing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : subscription ? (
                      'Unsubscribe'
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </div>

                {/* Test Notifications */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Notifications</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSendNotification('info')}
                      className="h-auto p-4 flex flex-col gap-2"
                    >
                      <Info className="w-5 h-5" />
                      <span className="text-sm">Info</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSendNotification('success')}
                      className="h-auto p-4 flex flex-col gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">Success</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSendNotification('warning')}
                      className="h-auto p-4 flex flex-col gap-2"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-sm">Warning</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSendNotification('error')}
                      className="h-auto p-4 flex flex-col gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm">Error</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationQuery.data?.recentNotifications?.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'warning' ? 'bg-yellow-100' :
                        notification.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {notification.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                         notification.type === 'warning' ? <AlertTriangle className="w-6 h-6 text-yellow-600" /> :
                         notification.type === 'error' ? <XCircle className="w-6 h-6 text-red-600" /> :
                         <Info className="w-6 h-6 text-blue-600" />}
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
                        <div className="text-sm font-medium">{notification.timestamp}</div>
                        <div className="text-xs text-muted-foreground">
                          {notification.priority}
                        </div>
                      </div>
                      
                      <Badge variant={notification.read ? 'secondary' : 'default'}>
                        {notification.read ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Alerts Tab */}
      {selectedTab === 'alerts' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Smart Alerts
              </CardTitle>
              <CardDescription>
                Intelligent alerts og automated notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertsQuery.data?.smartAlerts?.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{alert.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {alert.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{alert.condition}</div>
                        <div className="text-xs text-muted-foreground">
                          {alert.frequency}
                        </div>
                      </div>
                      
                      <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alert Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Alert Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {alertsQuery.data?.alertCategories?.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <category.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.count} alerts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notification Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Notification Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsQuery.data?.metrics?.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notification Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Notification Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsQuery.data?.trends?.map((trend) => (
                    <div key={trend.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <trend.icon className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{trend.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {trend.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Notification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsQuery.data?.notificationHistory?.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Bell className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {notification.type} • {notification.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{notification.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {notification.deliveryTime}
                        </div>
                      </div>
                      
                      <Badge variant={notification.status === 'Delivered' ? 'default' : 'secondary'}>
                        {notification.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.settings?.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <setting.icon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{setting.name}</span>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => {
                        if (setting.key === 'notificationsEnabled') {
                          handleToggleNotifications(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.preferences?.map((preference) => (
                  <div key={preference.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{preference.name}</span>
                      <span className="text-sm font-medium">{preference.value}</span>
                    </div>
                    <Progress value={preference.percentage} className="h-2" />
                  </div>
                ))}
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
              <Bell className="w-5 h-5" />
              <span className="text-sm">Subscribe</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Test Alert</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
