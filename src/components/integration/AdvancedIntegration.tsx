'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Link,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Stop,
  Timer,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  File,
  Folder,
  Database,
  Server,
  Cloud,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Bell,
  Mail,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Bluetooth,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Search,
  Filter,
  Grid3x3,
  List,
  Layers,
  Crosshair,
  Aim,
  Magic,
  Launch,
  King,
  Victory,
  Prize,
  Favorite,
  Details,
  Error,
  Warning,
  Success,
  Update,
  Config,
  Goal,
  Fitness,
  Pulse,
  Eye,
  EyeOff,
  Shield,
  Lock,
  Unlock,
  Download,
  Upload,
  Share2,
  Heart,
  DollarSign,
  Activity,
  Brain,
  Home,
  ExternalLink,
  AlertTriangle,
  Leaf,
  LayoutDashboard,
  BookOpen,
  MapPin as Location,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles,
  CheckSquare,
  Target,
  MessageSquare,
  Phone,
  FileText,
  Music,
  Video,
  Gamepad2,
  Workflow,
  Cpu,
  Code,
  Terminal,
  Zap,
  Clock,
  Webhook,
  Api,
  Database as Db,
  Network
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedIntegrationProps {
  className?: string
}

export function AdvancedIntegration({ className }: AdvancedIntegrationProps) {
  const [selectedTab, setSelectedTab] = useState<'apis' | 'services' | 'sync' | 'settings'>('apis')
  const [isConnecting, setIsConnecting] = useState(false)
  const [integrationEnabled, setIntegrationEnabled] = useState(true)
  const [selectedApi, setSelectedApi] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Integration queries
  const apisQuery = trpc.integration.getAPIsData.useQuery()
  const servicesQuery = trpc.integration.getServicesData.useQuery()
  const syncQuery = trpc.integration.getSyncData.useQuery()
  const settingsQuery = trpc.integration.getIntegrationSettings.useQuery()

  const connectAPIMutation = trpc.integration.connectAPI.useMutation()
  const connectServiceMutation = trpc.integration.connectService.useMutation()
  const syncDataMutation = trpc.integration.syncData.useMutation()
  const updateSettingsMutation = trpc.integration.updateSettings.useMutation()

  const handleConnectAPI = async (apiData: any) => {
    try {
      setIsConnecting(true)
      haptic.selection()

      const result = await connectAPIMutation.mutateAsync(apiData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to connect API:', error)
      haptic.error()
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConnectService = async (serviceData: any) => {
    try {
      haptic.selection()

      const result = await connectServiceMutation.mutateAsync(serviceData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to connect service:', error)
      haptic.error()
    }
  }

  const handleSyncData = async (syncData: any) => {
    try {
      haptic.selection()

      const result = await syncDataMutation.mutateAsync(syncData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to sync data:', error)
      haptic.error()
    }
  }

  const handleToggleIntegration = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ integrationEnabled: enabled })
      setIntegrationEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle integration:', error)
    }
  }

  const getAPIStatus = (status: string) => {
    switch (status) {
      case 'connected': return { color: 'text-green-600', label: 'Connected', icon: CheckCircle }
      case 'connecting': return { color: 'text-blue-600', label: 'Connecting', icon: RefreshCw }
      case 'disconnected': return { color: 'text-gray-600', label: 'Disconnected', icon: XCircle }
      case 'error': return { color: 'text-red-600', label: 'Error', icon: AlertTriangle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getServiceStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: CheckCircle }
      case 'inactive': return { color: 'text-gray-600', label: 'Inactive', icon: Pause }
      case 'error': return { color: 'text-red-600', label: 'Error', icon: XCircle }
      case 'syncing': return { color: 'text-blue-600', label: 'Syncing', icon: RefreshCw }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Integration</h2>
          <p className="text-muted-foreground">
            API management, third-party services og data synchronization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Link className="w-3 h-3" />
            Integration Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Api className="w-3 h-3" />
            APIs Connected
          </Badge>
        </div>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected APIs</CardTitle>
            <Api className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {apisQuery.data?.connectedAPIs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Third-party Services</CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {servicesQuery.data?.activeServices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Integrated services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sync Status</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {syncQuery.data?.syncStatus || 'OK'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last sync: {syncQuery.data?.lastSync || '2 min ago'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integration Score</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.integrationScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Connection health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'apis' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('apis')}
          className="flex-1"
        >
          <Api className="w-4 h-4 mr-2" />
          APIs
        </Button>
        <Button
          variant={selectedTab === 'services' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('services')}
          className="flex-1"
        >
          <Globe className="w-4 h-4 mr-2" />
          Services
        </Button>
        <Button
          variant={selectedTab === 'sync' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('sync')}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync
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

      {/* APIs Tab */}
      {selectedTab === 'apis' && (
        <div className="space-y-4">
          {/* API Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Api className="w-5 h-5" />
                API Management
              </CardTitle>
              <CardDescription>
                Manage og monitor your API connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apisQuery.data?.apis?.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <api.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{api.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {api.endpoint} • {api.method}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{api.calls}</div>
                        <div className="text-xs text-muted-foreground">
                          {api.responseTime}ms avg
                        </div>
                      </div>

                      <Button
                        onClick={() => handleConnectAPI({ apiId: api.id, action: 'connect' })}
                        variant="outline"
                        size="sm"
                      >
                        <Link className="w-4 h-4" />
                      </Button>

                      <Badge variant={api.status === 'connected' ? 'default' : 'secondary'}>
                        {api.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                API Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {apisQuery.data?.apiAnalytics?.map((analytic) => (
                  <div key={analytic.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <analytic.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{analytic.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {analytic.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services Tab */}
      {selectedTab === 'services' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Third-party Services
              </CardTitle>
              <CardDescription>
                Connect og manage external services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicesQuery.data?.services?.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.description} • {service.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{service.lastSync}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.syncFrequency}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleConnectService({ serviceId: service.id, action: 'connect' })}
                        variant="outline"
                        size="sm"
                      >
                        <Globe className="w-4 h-4" />
                      </Button>

                      <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Services Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicesQuery.data?.servicesAnalytics?.map((analytic) => (
                  <div key={analytic.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{analytic.name}</span>
                      <span className="text-sm font-medium">{analytic.value}</span>
                    </div>
                    <Progress value={analytic.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sync Tab */}
      {selectedTab === 'sync' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Data Synchronization
              </CardTitle>
              <CardDescription>
                Manage data sync og real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncQuery.data?.syncJobs?.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <job.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{job.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.description} • {job.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{job.lastSync}</div>
                        <div className="text-xs text-muted-foreground">
                          {job.syncStatus}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSyncData({ jobId: job.id, action: 'sync' })}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>

                      <Badge variant={job.status === 'synced' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sync Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sync Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {syncQuery.data?.syncAnalytics?.map((analytic) => (
                  <div key={analytic.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <analytic.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="font-medium">{analytic.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {analytic.value}
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
                Integration Settings
              </CardTitle>
              <CardDescription>
                Configure your integration preferences
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
                        if (setting.key === 'integrationEnabled') {
                          handleToggleIntegration(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Integration Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.integrationGoals?.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm font-medium">{goal.current}%</span>
                    </div>
                    <Progress value={goal.current} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Target: {goal.target}%
                    </div>
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
              <Api className="w-5 h-5" />
              <span className="text-sm">Connect API</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm">Add Service</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Sync Data</span>
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
