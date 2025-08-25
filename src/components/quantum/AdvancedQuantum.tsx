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
  Activity as QuantumMonitor
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedQuantumProps {
  className?: string
}

export function AdvancedQuantum({ className }: AdvancedQuantumProps) {
  const [selectedTab, setSelectedTab] = useState<'algorithms' | 'simulation' | 'integration' | 'settings'>('algorithms')
  const [isRunning, setIsRunning] = useState(false)
  const [quantumEnabled, setQuantumEnabled] = useState(true)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null)
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Quantum queries
  const algorithmsQuery = trpc.quantum.getAlgorithmsData.useQuery()
  const simulationQuery = trpc.quantum.getSimulationData.useQuery()
  const integrationQuery = trpc.quantum.getIntegrationData.useQuery()
  const settingsQuery = trpc.quantum.getQuantumSettings.useQuery()

  const runAlgorithmMutation = trpc.quantum.runAlgorithm.useMutation()
  const startSimulationMutation = trpc.quantum.startSimulation.useMutation()
  const optimizeCircuitMutation = trpc.quantum.optimizeCircuit.useMutation()
  const updateSettingsMutation = trpc.quantum.updateSettings.useMutation()

  const handleRunAlgorithm = async (algorithmData: any) => {
    try {
      setIsRunning(true)
      haptic.selection()

      const result = await runAlgorithmMutation.mutateAsync(algorithmData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to run algorithm:', error)
      haptic.error()
    } finally {
      setIsRunning(false)
    }
  }

  const handleStartSimulation = async (simulationData: any) => {
    try {
      haptic.selection()

      const result = await startSimulationMutation.mutateAsync(simulationData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start simulation:', error)
      haptic.error()
    }
  }

  const handleOptimizeCircuit = async (circuitData: any) => {
    try {
      haptic.selection()

      const result = await optimizeCircuitMutation.mutateAsync(circuitData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to optimize circuit:', error)
      haptic.error()
    }
  }

  const handleToggleQuantum = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ quantumEnabled: enabled })
      setQuantumEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle quantum:', error)
    }
  }

  const getAlgorithmStatus = (status: string) => {
    switch (status) {
      case 'running': return { color: 'text-blue-600', label: 'Running', icon: RefreshCw }
      case 'completed': return { color: 'text-green-600', label: 'Completed', icon: CheckCircle }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'queued': return { color: 'text-yellow-600', label: 'Queued', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getSimulationStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: CheckCircle }
      case 'paused': return { color: 'text-yellow-600', label: 'Paused', icon: Pause }
      case 'error': return { color: 'text-red-600', label: 'Error', icon: XCircle }
      case 'stopped': return { color: 'text-gray-600', label: 'Stopped', icon: Stop }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Quantum Computing</h2>
          <p className="text-muted-foreground">
            Quantum algorithm management, simulation og quantum-classical integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Quantum className="w-3 h-3" />
            Quantum Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <QuantumProcessor className="w-3 h-3" />
            Quantum Ready
          </Badge>
        </div>
      </div>

      {/* Quantum Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Algorithms</CardTitle>
            <QuantumAlgorithm className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {algorithmsQuery.data?.activeAlgorithms || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Running algorithms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantum Simulations</CardTitle>
            <QuantumSimulation className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {simulationQuery.data?.activeSimulations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active simulations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantum Circuits</CardTitle>
            <QuantumCircuit className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {integrationQuery.data?.quantumCircuits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Optimized circuits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantum Score</CardTitle>
            <QuantumSystem className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.quantumScore || 0}%
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
          variant={selectedTab === 'algorithms' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('algorithms')}
          className="flex-1"
        >
          <QuantumAlgorithm className="w-4 h-4 mr-2" />
          Algorithms
        </Button>
        <Button
          variant={selectedTab === 'simulation' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('simulation')}
          className="flex-1"
        >
          <QuantumSimulation className="w-4 h-4 mr-2" />
          Simulation
        </Button>
        <Button
          variant={selectedTab === 'integration' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('integration')}
          className="flex-1"
        >
          <QuantumIntegration className="w-4 h-4 mr-2" />
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

      {/* Algorithms Tab */}
      {selectedTab === 'algorithms' && (
        <div className="space-y-4">
          {/* Quantum Algorithm Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QuantumAlgorithm className="w-5 h-5" />
                Quantum Algorithm Management
              </CardTitle>
              <CardDescription>
                Run og manage quantum algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {algorithmsQuery.data?.algorithms?.map((algorithm) => (
                  <div key={algorithm.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <algorithm.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{algorithm.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {algorithm.description} • {algorithm.complexity}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{algorithm.qubits}</div>
                        <div className="text-xs text-muted-foreground">
                          {algorithm.lastRun}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRunAlgorithm({ algorithmId: algorithm.id, action: 'run' })}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={algorithm.status === 'completed' ? 'default' : 'secondary'}>
                        {algorithm.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Algorithm Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {algorithmsQuery.data?.algorithmAnalytics?.map((analytic) => (
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

      {/* Simulation Tab */}
      {selectedTab === 'simulation' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QuantumSimulation className="w-5 h-5" />
                Quantum Simulation
              </CardTitle>
              <CardDescription>
                Manage quantum simulations og experiments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulationQuery.data?.simulations?.map((simulation) => (
                  <div key={simulation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <simulation.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{simulation.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {simulation.description} • {simulation.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{simulation.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {simulation.qubits} qubits
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartSimulation({ simulationId: simulation.id, action: 'start' })}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={simulation.status === 'active' ? 'default' : 'secondary'}>
                        {simulation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Simulation Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Simulation Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulationQuery.data?.simulationAnalytics?.map((analytic) => (
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
                <QuantumIntegration className="w-5 h-5" />
                Quantum-Classical Integration
              </CardTitle>
              <CardDescription>
                Manage quantum circuits og classical integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationQuery.data?.circuits?.map((circuit) => (
                  <div key={circuit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <circuit.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{circuit.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {circuit.description} • {circuit.gates} gates
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{circuit.depth}</div>
                        <div className="text-xs text-muted-foreground">
                          {circuit.lastOptimized}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOptimizeCircuit({ circuitId: circuit.id, action: 'optimize' })}
                        variant="outline"
                        size="sm"
                      >
                        <QuantumCircuit className="w-4 h-4" />
                      </Button>

                      <Badge variant={circuit.status === 'optimized' ? 'default' : 'secondary'}>
                        {circuit.status}
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
                Quantum Settings
              </CardTitle>
              <CardDescription>
                Configure your quantum computing preferences
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
                        if (setting.key === 'quantumEnabled') {
                          handleToggleQuantum(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quantum Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quantum Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.quantumGoals?.map((goal) => (
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
              <QuantumAlgorithm className="w-5 h-5" />
              <span className="text-sm">Run Algorithm</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <QuantumSimulation className="w-5 h-5" />
              <span className="text-sm">Start Simulation</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <QuantumCircuit className="w-5 h-5" />
              <span className="text-sm">Optimize Circuit</span>
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
