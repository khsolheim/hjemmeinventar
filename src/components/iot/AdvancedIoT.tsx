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
  Activity as Performance,
  PieChart,
  LineChart,
  TrendingDown,
  Download as Export,
  FileText as Report,
  BarChart,
  PieChart as Chart,
  Activity as Analytics,
  Link,
  Wallet,
  Coins,
  Bitcoin,
  Ethereum,
  Zap as Lightning,
  Shield as Security,
  Lock as Privacy,
  Globe as Web3,
  Database as Blockchain,
  Network as DeFi,
  Activity as Mining,
  Timer as Gas,
  DollarSign as Token,
  Star as NFT,
  Award as SmartContract,
  Trophy as Governance,
  Crown as DAO,
  Rocket as Deploy,
  Sparkles as Mint,
  CheckSquare as Verify,
  Target as Consensus,
  MessageSquare as Transaction,
  Phone as Mobile,
  FileText as Document,
  Music as Audio,
  Video as Media,
  Gamepad2 as Gaming,
  Workflow as Workflow,
  Cpu as Compute,
  Code as Code,
  Terminal as CLI,
  Clock as Time,
  Webhook as Webhook,
  Api as API,
  Database as Storage,
  Network as Network,
  Gauge as Metrics,
  HardDrive as Storage,
  Memory as Memory,
  Cpu as CPU,
  Wifi as WiFi,
  HardDrive as Disk,
  Activity as Activity,
  PieChart as Chart,
  LineChart as Trend,
  TrendingDown as Decline,
  Download as Download,
  FileText as File,
  BarChart as Graph,
  PieChart as Circle,
  Activity as Monitor,
  Link as Connect,
  Wallet as Wallet,
  Coins as Coins,
  Bitcoin as BTC,
  Ethereum as ETH,
  Zap as Lightning,
  Shield as Security,
  Lock as Privacy,
  Globe as Web3,
  Database as Chain,
  Network as Network,
  Activity as Mining,
  Timer as Gas,
  DollarSign as Money,
  Star as NFT,
  Award as Contract,
  Trophy as Governance,
  Crown as DAO,
  Rocket as Deploy,
  Sparkles as Mint,
  CheckSquare as Verify,
  Target as Consensus,
  MessageSquare as Message,
  Phone as Mobile,
  FileText as Document,
  Music as Audio,
  Video as Media,
  Gamepad2 as Gaming,
  Workflow as Workflow,
  Cpu as Compute,
  Code as Code,
  Terminal as CLI,
  Clock as Time,
  Webhook as Webhook,
  Api as API,
  Database as Storage,
  Network as Network,
  Gauge as Metrics,
  HardDrive as Storage,
  Memory as Memory,
  Cpu as CPU,
  Wifi as WiFi,
  HardDrive as Disk,
  Activity as Activity,
  PieChart as Chart,
  LineChart as Trend,
  TrendingDown as Decline,
  Download as Download,
  FileText as File,
  BarChart as Graph,
  PieChart as Circle,
  Activity as Monitor,
  Zap,
  Wifi as IoT,
  Bluetooth as Sensor,
  Home as SmartHome,
  Shield as IoTSecurity,
  Lock as IoTPrivacy,
  Globe as IoTNetwork,
  Database as IoTDatabase,
  Network as IoTSensor,
  Activity as IoTAnalytics,
  Timer as IoTTimer,
  DollarSign as IoTCost,
  Star as IoTDevice,
  Award as IoTSystem,
  Trophy as IoTAchievement,
  Crown as IoTCrown,
  Rocket as IoTDeploy,
  Sparkles as IoTMagic,
  CheckSquare as IoTCheck,
  Target as IoTTarget,
  MessageSquare as IoTMessage,
  Phone as IoTSmartphone,
  FileText as IoTDocument,
  Music as IoTMusic,
  Video as IoTVideo,
  Gamepad2 as IoTGame,
  Workflow as IoTWorkflow,
  Cpu as IoTCpu,
  Code as IoTCode,
  Terminal as IoTTerminal,
  Clock as IoTClock,
  Webhook as IoTWebhook,
  Api as IoTApi,
  Database as IoTStorage,
  Network as IoTNetwork2,
  Gauge as IoTGauge,
  HardDrive as IoTStorage2,
  Memory as IoTMemory,
  Cpu as IoTCpu2,
  Wifi as IoTWifi,
  HardDrive as IoTDisk,
  Activity as IoTActivity,
  PieChart as IoTChart,
  LineChart as IoTTrend,
  TrendingDown as IoTDecline,
  Download as IoTDownload,
  FileText as IoTFile,
  BarChart as IoTGraph,
  PieChart as IoTCircle,
  Activity as IoTMonitor
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedIoTProps {
  className?: string
}

export function AdvancedIoT({ className }: AdvancedIoTProps) {
  const [selectedTab, setSelectedTab] = useState<'devices' | 'sensors' | 'smart-home' | 'settings'>('devices')
  const [isConnecting, setIsConnecting] = useState(false)
  const [iotEnabled, setIotEnabled] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // IoT queries
  const devicesQuery = trpc.iot.getDevicesData.useQuery()
  const sensorsQuery = trpc.iot.getSensorsData.useQuery()
  const smartHomeQuery = trpc.iot.getSmartHomeData.useQuery()
  const settingsQuery = trpc.iot.getIoTSettings.useQuery()

  const connectDeviceMutation = trpc.iot.connectDevice.useMutation()
  const monitorSensorMutation = trpc.iot.monitorSensor.useMutation()
  const controlSmartHomeMutation = trpc.iot.controlSmartHome.useMutation()
  const updateSettingsMutation = trpc.iot.updateSettings.useMutation()

  const handleConnectDevice = async (deviceData: any) => {
    try {
      setIsConnecting(true)
      haptic.selection()

      const result = await connectDeviceMutation.mutateAsync(deviceData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to connect device:', error)
      haptic.error()
    } finally {
      setIsConnecting(false)
    }
  }

  const handleMonitorSensor = async (sensorData: any) => {
    try {
      haptic.selection()

      const result = await monitorSensorMutation.mutateAsync(sensorData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to monitor sensor:', error)
      haptic.error()
    }
  }

  const handleControlSmartHome = async (smartHomeData: any) => {
    try {
      haptic.selection()

      const result = await controlSmartHomeMutation.mutateAsync(smartHomeData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to control smart home:', error)
      haptic.error()
    }
  }

  const handleToggleIoT = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ iotEnabled: enabled })
      setIotEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle IoT:', error)
    }
  }

  const getDeviceStatus = (status: string) => {
    switch (status) {
      case 'connected': return { color: 'text-green-600', label: 'Connected', icon: CheckCircle }
      case 'connecting': return { color: 'text-blue-600', label: 'Connecting', icon: RefreshCw }
      case 'disconnected': return { color: 'text-gray-600', label: 'Disconnected', icon: XCircle }
      case 'error': return { color: 'text-red-600', label: 'Error', icon: AlertTriangle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getSensorStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: CheckCircle }
      case 'inactive': return { color: 'text-gray-600', label: 'Inactive', icon: Pause }
      case 'error': return { color: 'text-red-600', label: 'Error', icon: XCircle }
      case 'calibrating': return { color: 'text-blue-600', label: 'Calibrating', icon: RefreshCw }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced IoT</h2>
          <p className="text-muted-foreground">
            Device management, sensor monitoring og smart home integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <IoT className="w-3 h-3" />
            IoT Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <SmartHome className="w-3 h-3" />
            Smart Home Ready
          </Badge>
        </div>
      </div>

      {/* IoT Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Devices</CardTitle>
            <IoTDevice className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {devicesQuery.data?.connectedDevices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
            <Sensor className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sensorsQuery.data?.activeSensors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoring sensors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Home Devices</CardTitle>
            <SmartHome className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {smartHomeQuery.data?.smartHomeDevices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Connected devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IoT Score</CardTitle>
            <IoTSystem className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.iotScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'devices' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('devices')}
          className="flex-1"
        >
          <IoTDevice className="w-4 h-4 mr-2" />
          Devices
        </Button>
        <Button
          variant={selectedTab === 'sensors' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('sensors')}
          className="flex-1"
        >
          <Sensor className="w-4 h-4 mr-2" />
          Sensors
        </Button>
        <Button
          variant={selectedTab === 'smart-home' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('smart-home')}
          className="flex-1"
        >
          <SmartHome className="w-4 h-4 mr-2" />
          Smart Home
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

      {/* Devices Tab */}
      {selectedTab === 'devices' && (
        <div className="space-y-4">
          {/* Device Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IoTDevice className="w-5 h-5" />
                Device Management
              </CardTitle>
              <CardDescription>
                Connect og manage IoT devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devicesQuery.data?.devices?.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <device.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {device.description} • {device.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{device.lastSeen}</div>
                        <div className="text-xs text-muted-foreground">
                          {device.battery}% battery
                        </div>
                      </div>

                      <Button
                        onClick={() => handleConnectDevice({ deviceId: device.id, action: 'connect' })}
                        variant="outline"
                        size="sm"
                      >
                        <Link className="w-4 h-4" />
                      </Button>

                      <Badge variant={device.status === 'connected' ? 'default' : 'secondary'}>
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Device Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {devicesQuery.data?.deviceAnalytics?.map((analytic) => (
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

      {/* Sensors Tab */}
      {selectedTab === 'sensors' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sensor className="w-5 h-5" />
                Sensor Monitoring
              </CardTitle>
              <CardDescription>
                Monitor og manage sensors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensorsQuery.data?.sensors?.map((sensor) => (
                  <div key={sensor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <sensor.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{sensor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sensor.description} • {sensor.value} {sensor.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{sensor.lastReading}</div>
                        <div className="text-xs text-muted-foreground">
                          {sensor.location}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleMonitorSensor({ sensorId: sensor.id, action: 'monitor' })}
                        variant="outline"
                        size="sm"
                      >
                        <Sensor className="w-4 h-4" />
                      </Button>

                      <Badge variant={sensor.status === 'active' ? 'default' : 'secondary'}>
                        {sensor.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sensor Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Sensor Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensorsQuery.data?.sensorAnalytics?.map((analytic) => (
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

      {/* Smart Home Tab */}
      {selectedTab === 'smart-home' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SmartHome className="w-5 h-5" />
                Smart Home Control
              </CardTitle>
              <CardDescription>
                Control smart home devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smartHomeQuery.data?.smartHomeDevices?.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <device.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {device.description} • {device.room}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{device.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {device.lastAction}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleControlSmartHome({ deviceId: device.id, action: 'control' })}
                        variant="outline"
                        size="sm"
                      >
                        <SmartHome className="w-4 h-4" />
                      </Button>

                      <Badge variant={device.status === 'on' ? 'default' : 'secondary'}>
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Smart Home Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Smart Home Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {smartHomeQuery.data?.smartHomeAnalytics?.map((analytic) => (
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
                IoT Settings
              </CardTitle>
              <CardDescription>
                Configure your IoT preferences
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
                        if (setting.key === 'iotEnabled') {
                          handleToggleIoT(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IoT Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                IoT Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.iotGoals?.map((goal) => (
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
              <IoTDevice className="w-5 h-5" />
              <span className="text-sm">Connect Device</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Sensor className="w-5 h-5" />
              <span className="text-sm">Monitor Sensor</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <SmartHome className="w-5 h-5" />
              <span className="text-sm">Control Home</span>
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
