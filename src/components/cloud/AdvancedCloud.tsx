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

interface AdvancedCloudProps {
  className?: string
}

export function AdvancedCloud({ className }: AdvancedCloudProps) {
  const [selectedTab, setSelectedTab] = useState<'infrastructure' | 'processing' | 'integration' | 'settings'>('infrastructure')
  const [isRunning, setIsRunning] = useState(false)
  const [cloudEnabled, setCloudEnabled] = useState(true)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Cloud queries
  const infrastructureQuery = trpc.cloud.getInfrastructureData.useQuery()
  const processingQuery = trpc.cloud.getProcessingData.useQuery()
  const integrationQuery = trpc.cloud.getIntegrationData.useQuery()
  const settingsQuery = trpc.cloud.getCloudSettings.useQuery()

  const deployServiceMutation = trpc.cloud.deployService.useMutation()
  const startProcessingMutation = trpc.cloud.startProcessing.useMutation()
  const syncServiceMutation = trpc.cloud.syncService.useMutation()
  const updateSettingsMutation = trpc.cloud.updateSettings.useMutation()

  const handleDeployService = async (serviceData: any) => {
    try {
      setIsRunning(true)
      haptic.selection()

      const result = await deployServiceMutation.mutateAsync(serviceData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to deploy service:', error)
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

  const handleSyncService = async (syncData: any) => {
    try {
      haptic.selection()

      const result = await syncServiceMutation.mutateAsync(syncData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to sync service:', error)
      haptic.error()
    }
  }

  const handleToggleCloud = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ cloudEnabled: enabled })
      setCloudEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle cloud:', error)
    }
  }

  const getServiceStatus = (status: string) => {
    switch (status) {
      case 'deployed': return { color: 'text-green-600', label: 'Deployed', icon: CheckCircle }
      case 'deploying': return { color: 'text-blue-600', label: 'Deploying', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'scaling': return { color: 'text-yellow-600', label: 'Scaling', icon: Clock }
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
          <h2 className="text-2xl font-bold">Advanced Cloud Computing</h2>
          <p className="text-muted-foreground">
            Infrastructure management, cloud processing og service integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            Cloud Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Server className="w-3 h-3" />
            Services Ready
          </Badge>
        </div>
      </div>

      {/* Cloud Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {infrastructureQuery.data?.activeServices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployed services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cloud Processing</CardTitle>
            <Cloud className="h-4 w-4 text-green-600" />
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
            <CardTitle className="text-sm font-medium">Service Sync</CardTitle>
            <Link className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {integrationQuery.data?.serviceSyncs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active syncs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cloud Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.cloudScore || 0}%
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
          variant={selectedTab === 'infrastructure' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('infrastructure')}
          className="flex-1"
        >
          <Server className="w-4 h-4 mr-2" />
          Infrastructure
        </Button>
        <Button
          variant={selectedTab === 'processing' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('processing')}
          className="flex-1"
        >
          <Cloud className="w-4 h-4 mr-2" />
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

      {/* Infrastructure Tab */}
      {selectedTab === 'infrastructure' && (
        <div className="space-y-4">
          {/* Infrastructure Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Infrastructure Management
              </CardTitle>
              <CardDescription>
                Deploy og manage cloud services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infrastructureQuery.data?.services?.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.description} • {service.region}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{service.uptime}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.deployed}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeployService({ serviceId: service.id, action: 'deploy' })}
                        variant="outline"
                        size="sm"
                      >
                        <Rocket className="w-4 h-4" />
                      </Button>

                      <Badge variant={service.status === 'deployed' ? 'default' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Infrastructure Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {infrastructureQuery.data?.infrastructureAnalytics?.map((analytic) => (
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
                <Cloud className="w-5 h-5" />
                Cloud Processing
              </CardTitle>
              <CardDescription>
                Manage cloud processing tasks og workflows
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
                Service Integration
              </CardTitle>
              <CardDescription>
                Manage service synchronization og data flow
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
                        onClick={() => handleSyncService({ syncId: sync.id, action: 'sync' })}
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
                Cloud Settings
              </CardTitle>
              <CardDescription>
                Configure your cloud preferences
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
                        if (setting.key === 'cloudEnabled') {
                          handleToggleCloud(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cloud Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Cloud Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.cloudGoals?.map((goal) => (
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
              <Server className="w-5 h-5" />
              <span className="text-sm">Deploy Service</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Cloud className="w-5 h-5" />
              <span className="text-sm">Start Processing</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Link className="w-5 h-5" />
              <span className="text-sm">Sync Service</span>
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
