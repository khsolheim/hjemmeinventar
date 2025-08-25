'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Zap,
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
  Clock,
  Webhook,
  Api,
  Database as Db,
  Network,
  Gauge,
  HardDrive,
  Memory,
  Cpu as Processor,
  Wifi as NetworkIcon,
  HardDrive as Storage,
  Activity as Performance
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedPerformanceProps {
  className?: string
}

export function AdvancedPerformance({ className }: AdvancedPerformanceProps) {
  const [selectedTab, setSelectedTab] = useState<'optimization' | 'caching' | 'cdn' | 'settings'>('optimization')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [performanceEnabled, setPerformanceEnabled] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [selectedCache, setSelectedCache] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Performance queries
  const optimizationQuery = trpc.performance.getOptimizationData.useQuery()
  const cachingQuery = trpc.performance.getCachingData.useQuery()
  const cdnQuery = trpc.performance.getCDNData.useQuery()
  const settingsQuery = trpc.performance.getPerformanceSettings.useQuery()

  const optimizeSystemMutation = trpc.performance.optimizeSystem.useMutation()
  const clearCacheMutation = trpc.performance.clearCache.useMutation()
  const updateCDNMutation = trpc.performance.updateCDN.useMutation()
  const updateSettingsMutation = trpc.performance.updateSettings.useMutation()

  const handleOptimizeSystem = async (optimizationData: any) => {
    try {
      setIsOptimizing(true)
      haptic.selection()

      const result = await optimizeSystemMutation.mutateAsync(optimizationData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to optimize system:', error)
      haptic.error()
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleClearCache = async (cacheData: any) => {
    try {
      haptic.selection()

      const result = await clearCacheMutation.mutateAsync(cacheData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to clear cache:', error)
      haptic.error()
    }
  }

  const handleUpdateCDN = async (cdnData: any) => {
    try {
      haptic.selection()

      const result = await updateCDNMutation.mutateAsync(cdnData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to update CDN:', error)
      haptic.error()
    }
  }

  const handleTogglePerformance = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ performanceEnabled: enabled })
      setPerformanceEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle performance:', error)
    }
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', label: 'Excellent', icon: Trophy }
    if (score >= 80) return { color: 'text-blue-600', label: 'Good', icon: Award }
    if (score >= 70) return { color: 'text-yellow-600', label: 'Fair', icon: Star }
    return { color: 'text-red-600', label: 'Poor', icon: AlertTriangle }
  }

  const getCacheStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: CheckCircle }
      case 'inactive': return { color: 'text-gray-600', label: 'Inactive', icon: Pause }
      case 'clearing': return { color: 'text-blue-600', label: 'Clearing', icon: RefreshCw }
      case 'error': return { color: 'text-red-600', label: 'Error', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Performance</h2>
          <p className="text-muted-foreground">
            System optimization, caching og performance monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Performance Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            System Optimized
          </Badge>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Gauge className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {optimizationQuery.data?.performanceScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {cachingQuery.data?.cacheHitRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Cache efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CDN Status</CardTitle>
            <NetworkIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {cdnQuery.data?.cdnStatus || 'OK'}
            </div>
            <p className="text-xs text-muted-foreground">
              Content delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Timer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {optimizationQuery.data?.avgResponseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'optimization' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('optimization')}
          className="flex-1"
        >
          <Zap className="w-4 h-4 mr-2" />
          Optimization
        </Button>
        <Button
          variant={selectedTab === 'caching' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('caching')}
          className="flex-1"
        >
          <HardDrive className="w-4 h-4 mr-2" />
          Caching
        </Button>
        <Button
          variant={selectedTab === 'cdn' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('cdn')}
          className="flex-1"
        >
          <NetworkIcon className="w-4 h-4 mr-2" />
          CDN
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

      {/* Optimization Tab */}
      {selectedTab === 'optimization' && (
        <div className="space-y-4">
          {/* System Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                System Optimization
              </CardTitle>
              <CardDescription>
                Monitor og optimize system performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationQuery.data?.optimizationMetrics?.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <metric.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.description} • {metric.currentValue}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{metric.score}%</div>
                        <div className="text-xs text-muted-foreground">
                          {metric.status}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOptimizeSystem({ metricId: metric.id, action: 'optimize' })}
                        variant="outline"
                        size="sm"
                      >
                        <Zap className="w-4 h-4" />
                      </Button>

                      <Badge variant={metric.score >= 80 ? 'default' : 'secondary'}>
                        {metric.score >= 80 ? 'Good' : 'Needs Optimization'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {optimizationQuery.data?.performanceAnalytics?.map((analytic) => (
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

      {/* Caching Tab */}
      {selectedTab === 'caching' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Cache Management
              </CardTitle>
              <CardDescription>
                Manage og monitor caching systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cachingQuery.data?.cacheSystems?.map((cache) => (
                  <div key={cache.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <cache.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{cache.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {cache.description} • {cache.size}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{cache.hitRate}%</div>
                        <div className="text-xs text-muted-foreground">
                          {cache.lastCleared}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleClearCache({ cacheId: cache.id, action: 'clear' })}
                        variant="outline"
                        size="sm"
                      >
                        <HardDrive className="w-4 h-4" />
                      </Button>

                      <Badge variant={cache.status === 'active' ? 'default' : 'secondary'}>
                        {cache.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cache Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Cache Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cachingQuery.data?.cacheAnalytics?.map((analytic) => (
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

      {/* CDN Tab */}
      {selectedTab === 'cdn' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NetworkIcon className="w-5 h-5" />
                CDN Management
              </CardTitle>
              <CardDescription>
                Manage content delivery network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cdnQuery.data?.cdnServices?.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-purple-600" />
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
                        <div className="text-sm font-medium">{service.uptime}%</div>
                        <div className="text-xs text-muted-foreground">
                          {service.lastSync}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleUpdateCDN({ serviceId: service.id, action: 'update' })}
                        variant="outline"
                        size="sm"
                      >
                        <NetworkIcon className="w-4 h-4" />
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

          {/* CDN Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                CDN Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cdnQuery.data?.cdnAnalytics?.map((analytic) => (
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
                Performance Settings
              </CardTitle>
              <CardDescription>
                Configure your performance preferences
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
                        if (setting.key === 'performanceEnabled') {
                          handleTogglePerformance(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.performanceGoals?.map((goal) => (
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
              <Zap className="w-5 h-5" />
              <span className="text-sm">Optimize System</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <HardDrive className="w-5 h-5" />
              <span className="text-sm">Clear Cache</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <NetworkIcon className="w-5 h-5" />
              <span className="text-sm">Update CDN</span>
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
