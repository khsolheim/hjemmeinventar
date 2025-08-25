'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  BarChart3,
  Settings,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
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
  Clock,
  Webhook,
  Network,
  Gauge,
  HardDrive,
  PieChart,
  LineChart,
  TrendingDown,
  BarChart,
  Link,
  Wallet,
  Coins,
  Bitcoin,
  Brain,
  Zap
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedMobileProps {
  className?: string
}

export function AdvancedMobile({ className }: AdvancedMobileProps) {
  const [selectedTab, setSelectedTab] = useState<'apps' | 'processing' | 'integration' | 'settings'>('apps')
  const [isRunning, setIsRunning] = useState(false)
  const [mobileEnabled, setMobileEnabled] = useState(true)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Mobile queries
  const appsQuery = trpc.mobile.getAppsData.useQuery()
  const processingQuery = trpc.mobile.getProcessingData.useQuery()
  const integrationQuery = trpc.mobile.getIntegrationData.useQuery()
  const settingsQuery = trpc.mobile.getMobileSettings.useQuery()

  const deployAppMutation = trpc.mobile.deployApp.useMutation()
  const startProcessingMutation = trpc.mobile.startProcessing.useMutation()
  const syncAppMutation = trpc.mobile.syncApp.useMutation()
  const updateSettingsMutation = trpc.mobile.updateSettings.useMutation()

  const handleDeployApp = async (appData: any) => {
    try {
      setIsRunning(true)
      haptic.selection()

      const result = await deployAppMutation.mutateAsync(appData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to deploy app:', error)
      haptic.error()
    } finally {
      setIsRunning(false)
    }
  }

  const handleStartProcessing = async (processingData: any) => {
    try {
      haptic.selection()

      const result = await startProcessingMutation.mutateAsync(processingData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start processing:', error)
      haptic.error()
    }
  }

  const handleSyncApp = async (syncData: any) => {
    try {
      haptic.selection()

      const result = await syncAppMutation.mutateAsync(syncData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to sync app:', error)
      haptic.error()
    }
  }

  const handleToggleMobile = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ mobileEnabled: enabled })
      setMobileEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle mobile:', error)
    }
  }

  const getAppStatus = (status: string) => {
    switch (status) {
      case 'deployed': return { color: 'text-green-600', label: 'Deployed', icon: CheckCircle }
      case 'deploying': return { color: 'text-blue-600', label: 'Deploying', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'updating': return { color: 'text-yellow-600', label: 'Updating', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getProcessingStatus = (status: string) => {
    switch (status) {
      case 'running': return { color: 'text-green-600', label: 'Running', icon: CheckCircle }
      case 'queued': return { color: 'text-yellow-600', label: 'Queued', icon: Clock }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'completed': return { color: 'text-blue-600', label: 'Completed', icon: CheckSquare }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Mobile</h2>
          <p className="text-muted-foreground">
            App management, mobile processing og app integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            Mobile Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Tablet className="w-3 h-3" />
            Apps Ready
          </Badge>
        </div>
      </div>

      {/* Mobile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Apps</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {appsQuery.data?.activeApps || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployed apps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Processing</CardTitle>
            <Tablet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {processingQuery.data?.activeProcesses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Running processes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">App Sync</CardTitle>
            <Link className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {integrationQuery.data?.appSyncs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active syncs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.mobileScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'apps' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('apps')}
          className="flex-1"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Apps
        </Button>
        <Button
          variant={selectedTab === 'processing' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('processing')}
          className="flex-1"
        >
          <Tablet className="w-4 h-4 mr-2" />
          Processing
        </Button>
        <Button
          variant={selectedTab === 'integration' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('integration')}
          className="flex-1"
        >
          <Link className="w-4 h-4 mr-2" />
          Integration
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

      {/* Apps Tab */}
      {selectedTab === 'apps' && (
        <div className="space-y-4">
          {/* App Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                App Management
              </CardTitle>
              <CardDescription>
                Deploy og manage mobile apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appsQuery.data?.apps?.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <app.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {app.description} • {app.platform}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{app.version}</div>
                        <div className="text-xs text-muted-foreground">
                          {app.deployed}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeployApp({ appId: app.id, action: 'deploy' })}
                        variant="outline"
                        size="sm"
                      >
                        <Rocket className="w-4 h-4" />
                      </Button>

                      <Badge variant={app.status === 'deployed' ? 'default' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* App Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                App Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {appsQuery.data?.appAnalytics?.map((analytic) => (
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

      {/* Processing Tab */}
      {selectedTab === 'processing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tablet className="w-5 h-5" />
                Mobile Processing
              </CardTitle>
              <CardDescription>
                Manage mobile processing tasks og workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingQuery.data?.processes?.map((process) => (
                  <div key={process.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <process.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{process.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {process.description} • {process.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{process.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {process.resources} resources
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartProcessing({ processId: process.id, action: 'start' })}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={process.status === 'running' ? 'default' : 'secondary'}>
                        {process.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processing Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Processing Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingQuery.data?.processingAnalytics?.map((analytic) => (
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

      {/* Integration Tab */}
      {selectedTab === 'integration' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                App Integration
              </CardTitle>
              <CardDescription>
                Manage app synchronization og data flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationQuery.data?.syncs?.map((sync) => (
                  <div key={sync.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <sync.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{sync.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sync.description} • {sync.frequency}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{sync.dataSize}</div>
                        <div className="text-xs text-muted-foreground">
                          {sync.lastSync}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSyncApp({ syncId: sync.id, action: 'sync' })}
                        variant="outline"
                        size="sm"
                      >
                        <Link className="w-4 h-4" />
                      </Button>

                      <Badge variant={sync.status === 'synced' ? 'default' : 'secondary'}>
                        {sync.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Integration Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {integrationQuery.data?.integrationAnalytics?.map((analytic) => (
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
                Mobile Settings
              </CardTitle>
              <CardDescription>
                Configure your mobile preferences
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
                        if (setting.key === 'mobileEnabled') {
                          handleToggleMobile(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mobile Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Mobile Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.mobileGoals?.map((goal) => (
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
              <Smartphone className="w-5 h-5" />
              <span className="text-sm">Deploy App</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Tablet className="w-5 h-5" />
              <span className="text-sm">Start Processing</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Link className="w-5 h-5" />
              <span className="text-sm">Sync App</span>
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
