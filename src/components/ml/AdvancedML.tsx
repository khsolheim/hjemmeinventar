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
  Activity as MLMonitor
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedMLProps {
  className?: string
}

export function AdvancedML({ className }: AdvancedMLProps) {
  const [selectedTab, setSelectedTab] = useState<'models' | 'analytics' | 'training' | 'settings'>('models')
  const [isTraining, setIsTraining] = useState(false)
  const [mlEnabled, setMlEnabled] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // ML queries
  const modelsQuery = trpc.ml.getModelsData.useQuery()
  const analyticsQuery = trpc.ml.getAnalyticsData.useQuery()
  const trainingQuery = trpc.ml.getTrainingData.useQuery()
  const settingsQuery = trpc.ml.getMLSettings.useQuery()

  const deployModelMutation = trpc.ml.deployModel.useMutation()
  const runAnalyticsMutation = trpc.ml.runAnalytics.useMutation()
  const startTrainingMutation = trpc.ml.startTraining.useMutation()
  const updateSettingsMutation = trpc.ml.updateSettings.useMutation()

  const handleDeployModel = async (modelData: any) => {
    try {
      haptic.selection()

      const result = await deployModelMutation.mutateAsync(modelData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to deploy model:', error)
      haptic.error()
    }
  }

  const handleRunAnalytics = async (analyticsData: any) => {
    try {
      haptic.selection()

      const result = await runAnalyticsMutation.mutateAsync(analyticsData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to run analytics:', error)
      haptic.error()
    }
  }

  const handleStartTraining = async (trainingData: any) => {
    try {
      setIsTraining(true)
      haptic.selection()

      const result = await startTrainingMutation.mutateAsync(trainingData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start training:', error)
      haptic.error()
    } finally {
      setIsTraining(false)
    }
  }

  const handleToggleML = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ mlEnabled: enabled })
      setMlEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle ML:', error)
    }
  }

  const getModelStatus = (status: string) => {
    switch (status) {
      case 'deployed': return { color: 'text-green-600', label: 'Deployed', icon: CheckCircle }
      case 'training': return { color: 'text-blue-600', label: 'Training', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'draft': return { color: 'text-gray-600', label: 'Draft', icon: Edit }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getTrainingStatus = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'text-green-600', label: 'Completed', icon: CheckCircle }
      case 'running': return { color: 'text-blue-600', label: 'Running', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'queued': return { color: 'text-yellow-600', label: 'Queued', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Machine Learning</h2>
          <p className="text-muted-foreground">
            AI model management, predictive analytics og data science integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <ML className="w-3 h-3" />
            ML Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI Ready
          </Badge>
        </div>
      </div>

      {/* ML Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <MLModel className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {modelsQuery.data?.activeModels || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployed models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <MLAnalytics className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analyticsQuery.data?.totalPredictions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Today's predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
            <MLWorkflow className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {trainingQuery.data?.activeJobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Running jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Score</CardTitle>
            <MLSystem className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.mlScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Model accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'models' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('models')}
          className="flex-1"
        >
          <MLModel className="w-4 h-4 mr-2" />
          Models
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('analytics')}
          className="flex-1"
        >
          <MLAnalytics className="w-4 h-4 mr-2" />
          Analytics
        </Button>
        <Button
          variant={selectedTab === 'training' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('training')}
          className="flex-1"
        >
          <MLWorkflow className="w-4 h-4 mr-2" />
          Training
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

      {/* Models Tab */}
      {selectedTab === 'models' && (
        <div className="space-y-4">
          {/* AI Model Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MLModel className="w-5 h-5" />
                AI Model Management
              </CardTitle>
              <CardDescription>
                Deploy og manage machine learning models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelsQuery.data?.models?.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <model.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {model.description} • {model.accuracy}% accuracy
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{model.version}</div>
                        <div className="text-xs text-muted-foreground">
                          {model.lastUpdated}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeployModel({ modelId: model.id, action: 'deploy' })}
                        variant="outline"
                        size="sm"
                      >
                        <Rocket className="w-4 h-4" />
                      </Button>

                      <Badge variant={model.status === 'deployed' ? 'default' : 'secondary'}>
                        {model.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Model Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {modelsQuery.data?.modelAnalytics?.map((analytic) => (
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

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MLAnalytics className="w-5 h-5" />
                Predictive Analytics
              </CardTitle>
              <CardDescription>
                Run predictive analytics og data science
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsQuery.data?.analytics?.map((analytic) => (
                  <div key={analytic.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <analytic.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{analytic.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {analytic.description} • {analytic.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{analytic.lastRun}</div>
                        <div className="text-xs text-muted-foreground">
                          {analytic.duration}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRunAnalytics({ analyticId: analytic.id, action: 'run' })}
                        variant="outline"
                        size="sm"
                      >
                        <MLAnalytics className="w-4 h-4" />
                      </Button>

                      <Badge variant={analytic.status === 'completed' ? 'default' : 'secondary'}>
                        {analytic.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Analytics Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsQuery.data?.analyticsResults?.map((result) => (
                  <div key={result.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{result.name}</span>
                      <span className="text-sm font-medium">{result.value}</span>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Training Tab */}
      {selectedTab === 'training' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MLWorkflow className="w-5 h-5" />
                Model Training
              </CardTitle>
              <CardDescription>
                Train og manage ML models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingQuery.data?.trainingJobs?.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <job.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{job.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.description} • {job.progress}% complete
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{job.eta}</div>
                        <div className="text-xs text-muted-foreground">
                          {job.dataset}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartTraining({ jobId: job.id, action: 'start' })}
                        variant="outline"
                        size="sm"
                      >
                        <MLWorkflow className="w-4 h-4" />
                      </Button>

                      <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Training Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Training Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trainingQuery.data?.trainingAnalytics?.map((analytic) => (
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
                ML Settings
              </CardTitle>
              <CardDescription>
                Configure your machine learning preferences
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
                        if (setting.key === 'mlEnabled') {
                          handleToggleML(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ML Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                ML Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.mlGoals?.map((goal) => (
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
              <MLModel className="w-5 h-5" />
              <span className="text-sm">Deploy Model</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <MLAnalytics className="w-5 h-5" />
              <span className="text-sm">Run Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <MLWorkflow className="w-5 h-5" />
              <span className="text-sm">Start Training</span>
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
