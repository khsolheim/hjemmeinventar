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
  Activity as EdgeMonitor,
  Wifi as Network5G,
  Cpu as NetworkNode,
  Code as NetworkCode,
  Database as NetworkData,
  Activity as NetworkAnalytics,
  Timer as NetworkTimer,
  DollarSign as NetworkCost,
  Star as NetworkDevice,
  Award as NetworkSystem,
  Trophy as NetworkAchievement,
  Crown as NetworkCrown,
  Rocket as NetworkDeploy,
  Sparkles as NetworkMagic,
  CheckSquare as NetworkCheck,
  Target as NetworkTarget,
  MessageSquare as NetworkMessage,
  Phone as NetworkSmartphone,
  FileText as NetworkDocument,
  Music as NetworkMusic,
  Video as NetworkVideo,
  Gamepad2 as NetworkGame,
  Workflow as NetworkWorkflow,
  Cpu as NetworkCpu,
  Code as NetworkCode2,
  Terminal as NetworkTerminal,
  Clock as NetworkClock,
  Webhook as NetworkWebhook,
  Api as NetworkApi,
  Database as NetworkStorage,
  Network as NetworkNetwork,
  Gauge as NetworkGauge,
  HardDrive as NetworkStorage2,
  Memory as NetworkMemory,
  Cpu as NetworkCpu2,
  Wifi as NetworkWifi,
  HardDrive as NetworkDisk,
  Activity as NetworkActivity,
  PieChart as NetworkChart,
  LineChart as NetworkTrend,
  TrendingDown as NetworkDecline,
  Download as NetworkDownload,
  FileText as NetworkFile,
  BarChart as NetworkGraph,
  PieChart as NetworkCircle,
  Activity as NetworkMonitor,
  Shield as Cyber,
  Cpu as CyberThreat,
  Code as CyberCode,
  Database as CyberData,
  Activity as CyberAnalytics,
  Timer as CyberTimer,
  DollarSign as CyberCost,
  Star as CyberDevice,
  Award as CyberSystem,
  Trophy as CyberAchievement,
  Crown as CyberCrown,
  Rocket as CyberDeploy,
  Sparkles as CyberMagic,
  CheckSquare as CyberCheck,
  Target as CyberTarget,
  MessageSquare as CyberMessage,
  Phone as CyberSmartphone,
  FileText as CyberDocument,
  Music as CyberMusic,
  Video as CyberVideo,
  Gamepad2 as CyberGame,
  Workflow as CyberWorkflow,
  Cpu as CyberCpu,
  Code as CyberCode2,
  Terminal as CyberTerminal,
  Clock as CyberClock,
  Webhook as CyberWebhook,
  Api as CyberApi,
  Database as CyberStorage,
  Network as CyberNetwork,
  Gauge as CyberGauge,
  HardDrive as CyberStorage2,
  Memory as CyberMemory,
  Cpu as CyberCpu2,
  Wifi as CyberWifi,
  HardDrive as CyberDisk,
  Activity as CyberActivity,
  PieChart as CyberChart,
  LineChart as CyberTrend,
  TrendingDown as CyberDecline,
  Download as CyberDownload,
  FileText as CyberFile,
  BarChart as CyberGraph,
  PieChart as CyberCircle,
  Activity as CyberMonitor
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedCybersecurityProps {
  className?: string
}

export function AdvancedCybersecurity({ className }: AdvancedCybersecurityProps) {
  const [selectedTab, setSelectedTab] = useState<'threats' | 'processing' | 'integration' | 'settings'>('threats')
  const [isRunning, setIsRunning] = useState(false)
  const [cyberEnabled, setCyberEnabled] = useState(true)
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Cybersecurity queries
  const threatsQuery = trpc.cybersecurity.getThreatsData.useQuery()
  const processingQuery = trpc.cybersecurity.getProcessingData.useQuery()
  const integrationQuery = trpc.cybersecurity.getIntegrationData.useQuery()
  const settingsQuery = trpc.cybersecurity.getCybersecuritySettings.useQuery()

  const blockThreatMutation = trpc.cybersecurity.blockThreat.useMutation()
  const startProcessingMutation = trpc.cybersecurity.startProcessing.useMutation()
  const syncSecurityMutation = trpc.cybersecurity.syncSecurity.useMutation()
  const updateSettingsMutation = trpc.cybersecurity.updateSettings.useMutation()

  const handleBlockThreat = async (threatData: any) => {
    try {
      setIsRunning(true)
      haptic.selection()

      const result = await blockThreatMutation.mutateAsync(threatData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to block threat:', error)
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

  const handleSyncSecurity = async (syncData: any) => {
    try {
      haptic.selection()

      const result = await syncSecurityMutation.mutateAsync(syncData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to sync security:', error)
      haptic.error()
    }
  }

  const handleToggleCyber = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ cyberEnabled: enabled })
      setCyberEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle cybersecurity:', error)
    }
  }

  const getThreatStatus = (status: string) => {
    switch (status) {
      case 'blocked': return { color: 'text-green-600', label: 'Blocked', icon: CheckCircle }
      case 'active': return { color: 'text-red-600', label: 'Active', icon: XCircle }
      case 'monitoring': return { color: 'text-yellow-600', label: 'Monitoring', icon: Clock }
      case 'investigating': return { color: 'text-blue-600', label: 'Investigating', icon: RefreshCw }
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
          <h2 className="text-2xl font-bold">Advanced Cybersecurity</h2>
          <p className="text-muted-foreground">
            Threat management, security processing og security integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Cyber className="w-3 h-3" />
            Security Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <CyberThreat className="w-3 h-3" />
            Threat Ready
          </Badge>
        </div>
      </div>

      {/* Cybersecurity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <CyberThreat className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {threatsQuery.data?.activeThreats || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Detected threats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Processing</CardTitle>
            <CyberProcessing className="h-4 w-4 text-green-600" />
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
            <CardTitle className="text-sm font-medium">Security Sync</CardTitle>
            <CyberIntegration className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {integrationQuery.data?.securitySyncs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active syncs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <CyberSystem className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.securityScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System security
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'threats' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('threats')}
          className="flex-1"
        >
          <CyberThreat className="w-4 h-4 mr-2" />
          Threats
        </Button>
        <Button
          variant={selectedTab === 'processing' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('processing')}
          className="flex-1"
        >
          <CyberProcessing className="w-4 h-4 mr-2" />
          Processing
        </Button>
        <Button
          variant={selectedTab === 'integration' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('integration')}
          className="flex-1"
        >
          <CyberIntegration className="w-4 h-4 mr-2" />
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

      {/* Threats Tab */}
      {selectedTab === 'threats' && (
        <div className="space-y-4">
          {/* Threat Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CyberThreat className="w-5 h-5" />
                Threat Management
              </CardTitle>
              <CardDescription>
                Monitor og block cybersecurity threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatsQuery.data?.threats?.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <threat.icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{threat.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {threat.description} • {threat.severity}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{threat.source}</div>
                        <div className="text-xs text-muted-foreground">
                          {threat.detected}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleBlockThreat({ threatId: threat.id, action: 'block' })}
                        variant="outline"
                        size="sm"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>

                      <Badge variant={threat.status === 'blocked' ? 'default' : 'destructive'}>
                        {threat.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Threat Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Threat Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {threatsQuery.data?.threatAnalytics?.map((analytic) => (
                  <div key={analytic.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <analytic.icon className="w-6 h-6 text-red-600" />
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
                <CyberProcessing className="w-5 h-5" />
                Security Processing
              </CardTitle>
              <CardDescription>
                Manage security processing tasks og workflows
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
                <CyberIntegration className="w-5 h-5" />
                Security Integration
              </CardTitle>
              <CardDescription>
                Manage security synchronization og data flow
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
                        onClick={() => handleSyncSecurity({ syncId: sync.id, action: 'sync' })}
                        variant="outline"
                        size="sm"
                      >
                        <CyberIntegration className="w-4 h-4" />
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
                Cybersecurity Settings
              </CardTitle>
              <CardDescription>
                Configure your cybersecurity preferences
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
                        if (setting.key === 'cyberEnabled') {
                          handleToggleCyber(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Security Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.securityGoals?.map((goal) => (
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
              <CyberThreat className="w-5 h-5" />
              <span className="text-sm">Block Threat</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <CyberProcessing className="w-5 h-5" />
              <span className="text-sm">Start Processing</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <CyberIntegration className="w-5 h-5" />
              <span className="text-sm">Sync Security</span>
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
