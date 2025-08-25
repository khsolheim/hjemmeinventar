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
  Activity as IoTMonitor,
  Eye as AR,
  EyeOff as VR,
  Shield as ARVRSecurity,
  Lock as ARVRPrivacy,
  Globe as ARVRNetwork,
  Database as ARVRDatabase,
  Network as ARVRSensor,
  Activity as ARVRAnalytics,
  Timer as ARVRTimer,
  DollarSign as ARVRCost,
  Star as ARVRDevice,
  Award as ARVRSystem,
  Trophy as ARVRAchievement,
  Crown as ARVRCrown,
  Rocket as ARVRDeploy,
  Sparkles as ARVRMagic,
  CheckSquare as ARVRCheck,
  Target as ARVRTarget,
  MessageSquare as ARVRMessage,
  Phone as ARVRSmartphone,
  FileText as ARVRDocument,
  Music as ARVRMusic,
  Video as ARVRVideo,
  Gamepad2 as ARVRGame,
  Workflow as ARVRWorkflow,
  Cpu as ARVRCpu,
  Code as ARVRCode,
  Terminal as ARVRTerminal,
  Clock as ARVRClock,
  Webhook as ARVRWebhook,
  Api as ARVRApi,
  Database as ARVRStorage,
  Network as ARVRNetwork2,
  Gauge as ARVRGauge,
  HardDrive as ARVRStorage2,
  Memory as ARVRMemory,
  Cpu as ARVRCpu2,
  Wifi as ARVRWifi,
  HardDrive as ARVRDisk,
  Activity as ARVRActivity,
  PieChart as ARVRChart,
  LineChart as ARVRTrend,
  TrendingDown as ARVRDecline,
  Download as ARVRDownload,
  FileText as ARVRFile,
  BarChart as ARVRGraph,
  PieChart as ARVRCircle,
  Activity as ARVRMonitor,
  Brain as ML,
  Cpu as MLModel,
  Code as MLCode,
  Database as MLData,
  Activity as MLAnalytics,
  Timer as MLTimer,
  DollarSign as MLCost,
  Star as MLAlgorithm,
  Award as MLSystem,
  Trophy as MLAchievement,
  Crown as MLCrown,
  Rocket as MLDeploy,
  Sparkles as MLMagic,
  CheckSquare as MLCheck,
  Target as MLTarget,
  MessageSquare as MLMessage,
  Phone as MLSmartphone,
  FileText as MLDocument,
  Music as MLMusic,
  Video as MLVideo,
  Gamepad2 as MLGame,
  Workflow as MLWorkflow,
  Cpu as MLCpu,
  Code as MLCode2,
  Terminal as MLTerminal,
  Clock as MLClock,
  Webhook as MLWebhook,
  Api as MLApi,
  Database as MLStorage,
  Network as MLNetwork,
  Gauge as MLGauge,
  HardDrive as MLStorage2,
  Memory as MLMemory,
  Cpu as MLCpu2,
  Wifi as MLWifi,
  HardDrive as MLDisk,
  Activity as MLActivity,
  PieChart as MLChart,
  LineChart as MLTrend,
  TrendingDown as MLDecline,
  Download as MLDownload,
  FileText as MLFile,
  BarChart as MLGraph,
  PieChart as MLCircle,
  Activity as MLMonitor,
  Zap as Quantum,
  Cpu as QuantumProcessor,
  Code as QuantumCode,
  Database as QuantumData,
  Activity as QuantumAnalytics,
  Timer as QuantumTimer,
  DollarSign as QuantumCost,
  Star as QuantumAlgorithm,
  Award as QuantumSystem,
  Trophy as QuantumAchievement,
  Crown as QuantumCrown,
  Rocket as QuantumDeploy,
  Sparkles as QuantumMagic,
  CheckSquare as QuantumCheck,
  Target as QuantumTarget,
  MessageSquare as QuantumMessage,
  Phone as QuantumSmartphone,
  FileText as QuantumDocument,
  Music as QuantumMusic,
  Video as QuantumVideo,
  Gamepad2 as QuantumGame,
  Workflow as QuantumWorkflow,
  Cpu as QuantumCpu,
  Code as QuantumCode2,
  Terminal as QuantumTerminal,
  Clock as QuantumClock,
  Webhook as QuantumWebhook,
  Api as QuantumApi,
  Database as QuantumStorage,
  Network as QuantumNetwork,
  Gauge as QuantumGauge,
  HardDrive as QuantumStorage2,
  Memory as QuantumMemory,
  Cpu as QuantumCpu2,
  Wifi as QuantumWifi,
  HardDrive as QuantumDisk,
  Activity as QuantumActivity,
  PieChart as QuantumChart,
  LineChart as QuantumTrend,
  TrendingDown as QuantumDecline,
  Download as QuantumDownload,
  FileText as QuantumFile,
  BarChart as QuantumGraph,
  PieChart as QuantumCircle,
  Activity as QuantumMonitor,
  Server as Edge,
  Cpu as EdgeNode,
  Code as EdgeCode,
  Database as EdgeData,
  Activity as EdgeAnalytics,
  Timer as EdgeTimer,
  DollarSign as EdgeCost,
  Star as EdgeDevice,
  Award as EdgeSystem,
  Trophy as EdgeAchievement,
  Crown as EdgeCrown,
  Rocket as EdgeDeploy,
  Sparkles as EdgeMagic,
  CheckSquare as EdgeCheck,
  Target as EdgeTarget,
  MessageSquare as EdgeMessage,
  Phone as EdgeSmartphone,
  FileText as EdgeDocument,
  Music as EdgeMusic,
  Video as EdgeVideo,
  Gamepad2 as EdgeGame,
  Workflow as EdgeWorkflow,
  Cpu as EdgeCpu,
  Code as EdgeCode2,
  Terminal as EdgeTerminal,
  Clock as EdgeClock,
  Webhook as EdgeWebhook,
  Api as EdgeApi,
  Database as EdgeStorage,
  Network as EdgeNetwork,
  Gauge as EdgeGauge,
  HardDrive as EdgeStorage2,
  Memory as EdgeMemory,
  Cpu as EdgeCpu2,
  Wifi as EdgeWifi,
  HardDrive as EdgeDisk,
  Activity as EdgeActivity,
  PieChart as EdgeChart,
  LineChart as EdgeTrend,
  TrendingDown as EdgeDecline,
  Download as EdgeDownload,
  FileText as EdgeFile,
  BarChart as EdgeGraph,
  PieChart as EdgeCircle,
  Activity as EdgeMonitor
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedEdgeProps {
  className?: string
}

export function AdvancedEdge({ className }: AdvancedEdgeProps) {
  const [selectedTab, setSelectedTab] = useState<'nodes' | 'processing' | 'integration' | 'settings'>('nodes')
  const [isRunning, setIsRunning] = useState(false)
  const [edgeEnabled, setEdgeEnabled] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Edge queries
  const nodesQuery = trpc.edge.getNodesData.useQuery()
  const processingQuery = trpc.edge.getProcessingData.useQuery()
  const integrationQuery = trpc.edge.getIntegrationData.useQuery()
  const settingsQuery = trpc.edge.getEdgeSettings.useQuery()

  const deployNodeMutation = trpc.edge.deployNode.useMutation()
  const startProcessingMutation = trpc.edge.startProcessing.useMutation()
  const syncCloudMutation = trpc.edge.syncCloud.useMutation()
  const updateSettingsMutation = trpc.edge.updateSettings.useMutation()

  const handleDeployNode = async (nodeData: any) => {
    try {
      setIsRunning(true)
      haptic.selection()

      const result = await deployNodeMutation.mutateAsync(nodeData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to deploy node:', error)
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

  const handleSyncCloud = async (syncData: any) => {
    try {
      haptic.selection()

      const result = await syncCloudMutation.mutateAsync(syncData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to sync cloud:', error)
      haptic.error()
    }
  }

  const handleToggleEdge = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ edgeEnabled: enabled })
      setEdgeEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle edge:', error)
    }
  }

  const getNodeStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: CheckCircle }
      case 'deploying': return { color: 'text-blue-600', label: 'Deploying', icon: RefreshCw }
      case 'offline': return { color: 'text-red-600', label: 'Offline', icon: XCircle }
      case 'maintenance': return { color: 'text-yellow-600', label: 'Maintenance', icon: Clock }
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
          <h2 className="text-2xl font-bold">Advanced Edge Computing</h2>
          <p className="text-muted-foreground">
            Edge node management, edge processing og edge-cloud integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Edge className="w-3 h-3" />
            Edge Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <EdgeNode className="w-3 h-3" />
            Edge Ready
          </Badge>
        </div>
      </div>

      {/* Edge Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
            <EdgeNode className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {nodesQuery.data?.activeNodes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployed nodes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Processing</CardTitle>
            <EdgeProcessing className="h-4 w-4 text-green-600" />
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
            <CardTitle className="text-sm font-medium">Cloud Sync</CardTitle>
            <EdgeIntegration className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {integrationQuery.data?.cloudSyncs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active syncs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Score</CardTitle>
            <EdgeSystem className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.edgeScore || 0}%
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
          variant={selectedTab === 'nodes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('nodes')}
          className="flex-1"
        >
          <EdgeNode className="w-4 h-4 mr-2" />
          Nodes
        </Button>
        <Button
          variant={selectedTab === 'processing' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('processing')}
          className="flex-1"
        >
          <EdgeProcessing className="w-4 h-4 mr-2" />
          Processing
        </Button>
        <Button
          variant={selectedTab === 'integration' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('integration')}
          className="flex-1"
        >
          <EdgeIntegration className="w-4 h-4 mr-2" />
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

      {/* Nodes Tab */}
      {selectedTab === 'nodes' && (
        <div className="space-y-4">
          {/* Edge Node Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EdgeNode className="w-5 h-5" />
                Edge Node Management
              </CardTitle>
              <CardDescription>
                Deploy og manage edge nodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nodesQuery.data?.nodes?.map((node) => (
                  <div key={node.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <node.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{node.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {node.description} • {node.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{node.capacity}</div>
                        <div className="text-xs text-muted-foreground">
                          {node.lastDeployed}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeployNode({ nodeId: node.id, action: 'deploy' })}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                        {node.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Node Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Node Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {nodesQuery.data?.nodeAnalytics?.map((analytic) => (
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
                <EdgeProcessing className="w-5 h-5" />
                Edge Processing
              </CardTitle>
              <CardDescription>
                Manage edge processing tasks og workflows
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
                <EdgeIntegration className="w-5 h-5" />
                Edge-Cloud Integration
              </CardTitle>
              <CardDescription>
                Manage edge-cloud synchronization og data flow
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
                        onClick={() => handleSyncCloud({ syncId: sync.id, action: 'sync' })}
                        variant="outline"
                        size="sm"
                      >
                        <EdgeIntegration className="w-4 h-4" />
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
                Edge Settings
              </CardTitle>
              <CardDescription>
                Configure your edge computing preferences
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
                        if (setting.key === 'edgeEnabled') {
                          handleToggleEdge(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edge Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Edge Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.edgeGoals?.map((goal) => (
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
              <EdgeNode className="w-5 h-5" />
              <span className="text-sm">Deploy Node</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <EdgeProcessing className="w-5 h-5" />
              <span className="text-sm">Start Processing</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <EdgeIntegration className="w-5 h-5" />
              <span className="text-sm">Sync Cloud</span>
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
