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
  Activity as ARVRMonitor
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedARVRProps {
  className?: string
}

export function AdvancedARVR({ className }: AdvancedARVRProps) {
  const [selectedTab, setSelectedTab] = useState<'experiences' | 'vr' | 'ar' | 'settings'>('experiences')
  const [isLaunching, setIsLaunching] = useState(false)
  const [arVrEnabled, setArVrEnabled] = useState(true)
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // AR/VR queries
  const experiencesQuery = trpc.arVr.getExperiencesData.useQuery()
  const vrQuery = trpc.arVr.getVRData.useQuery()
  const arQuery = trpc.arVr.getARData.useQuery()
  const settingsQuery = trpc.arVr.getARVRSettings.useQuery()

  const launchExperienceMutation = trpc.arVr.launchExperience.useMutation()
  const startVRMutation = trpc.arVr.startVR.useMutation()
  const startARMutation = trpc.arVr.startAR.useMutation()
  const updateSettingsMutation = trpc.arVr.updateSettings.useMutation()

  const handleLaunchExperience = async (experienceData: any) => {
    try {
      setIsLaunching(true)
      haptic.selection()

      const result = await launchExperienceMutation.mutateAsync(experienceData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to launch experience:', error)
      haptic.error()
    } finally {
      setIsLaunching(false)
    }
  }

  const handleStartVR = async (vrData: any) => {
    try {
      haptic.selection()

      const result = await startVRMutation.mutateAsync(vrData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start VR:', error)
      haptic.error()
    }
  }

  const handleStartAR = async (arData: any) => {
    try {
      haptic.selection()

      const result = await startARMutation.mutateAsync(arData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start AR:', error)
      haptic.error()
    }
  }

  const handleToggleARVR = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ arVrEnabled: enabled })
      setArVrEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle AR/VR:', error)
    }
  }

  const getExperienceStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: CheckCircle }
      case 'loading': return { color: 'text-blue-600', label: 'Loading', icon: RefreshCw }
      case 'paused': return { color: 'text-yellow-600', label: 'Paused', icon: Pause }
      case 'error': return { color: 'text-red-600', label: 'Error', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getContentStatus = (status: string) => {
    switch (status) {
      case 'ready': return { color: 'text-green-600', label: 'Ready', icon: CheckCircle }
      case 'processing': return { color: 'text-blue-600', label: 'Processing', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'draft': return { color: 'text-gray-600', label: 'Draft', icon: Edit }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced AR/VR</h2>
          <p className="text-muted-foreground">
            Immersive experiences, virtual reality og augmented reality integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <AR className="w-3 h-3" />
            AR/VR Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <VR className="w-3 h-3" />
            Immersive Ready
          </Badge>
        </div>
      </div>

      {/* AR/VR Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Experiences</CardTitle>
            <ARVRDevice className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {experiencesQuery.data?.activeExperiences || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Running experiences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VR Sessions</CardTitle>
            <VR className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vrQuery.data?.vrSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active VR sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AR Overlays</CardTitle>
            <AR className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {arQuery.data?.arOverlays || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active AR overlays
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AR/VR Score</CardTitle>
            <ARVRSystem className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.arVrScore || 0}%
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
          variant={selectedTab === 'experiences' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('experiences')}
          className="flex-1"
        >
          <ARVRDevice className="w-4 h-4 mr-2" />
          Experiences
        </Button>
        <Button
          variant={selectedTab === 'vr' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('vr')}
          className="flex-1"
        >
          <VR className="w-4 h-4 mr-2" />
          VR
        </Button>
        <Button
          variant={selectedTab === 'ar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('ar')}
          className="flex-1"
        >
          <AR className="w-4 h-4 mr-2" />
          AR
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

      {/* Experiences Tab */}
      {selectedTab === 'experiences' && (
        <div className="space-y-4">
          {/* Immersive Experiences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ARVRDevice className="w-5 h-5" />
                Immersive Experiences
              </CardTitle>
              <CardDescription>
                Launch og manage AR/VR experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experiencesQuery.data?.experiences?.map((experience) => (
                  <div key={experience.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <experience.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{experience.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {experience.description} • {experience.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{experience.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {experience.users} users
                        </div>
                      </div>

                      <Button
                        onClick={() => handleLaunchExperience({ experienceId: experience.id, action: 'launch' })}
                        variant="outline"
                        size="sm"
                      >
                        <Rocket className="w-4 h-4" />
                      </Button>

                      <Badge variant={experience.status === 'active' ? 'default' : 'secondary'}>
                        {experience.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Experience Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {experiencesQuery.data?.experienceAnalytics?.map((analytic) => (
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

      {/* VR Tab */}
      {selectedTab === 'vr' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VR className="w-5 h-5" />
                Virtual Reality
              </CardTitle>
              <CardDescription>
                Manage VR sessions og content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vrQuery.data?.vrContent?.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <content.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{content.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {content.description} • {content.resolution}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{content.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {content.fileSize}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartVR({ contentId: content.id, action: 'start' })}
                        variant="outline"
                        size="sm"
                      >
                        <VR className="w-4 h-4" />
                      </Button>

                      <Badge variant={content.status === 'ready' ? 'default' : 'secondary'}>
                        {content.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* VR Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                VR Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vrQuery.data?.vrAnalytics?.map((analytic) => (
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

      {/* AR Tab */}
      {selectedTab === 'ar' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AR className="w-5 h-5" />
                Augmented Reality
              </CardTitle>
              <CardDescription>
                Manage AR overlays og content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {arQuery.data?.arContent?.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <content.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{content.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {content.description} • {content.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{content.overlayCount}</div>
                        <div className="text-xs text-muted-foreground">
                          {content.lastUpdated}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartAR({ contentId: content.id, action: 'start' })}
                        variant="outline"
                        size="sm"
                      >
                        <AR className="w-4 h-4" />
                      </Button>

                      <Badge variant={content.status === 'ready' ? 'default' : 'secondary'}>
                        {content.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AR Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                AR Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {arQuery.data?.arAnalytics?.map((analytic) => (
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
                AR/VR Settings
              </CardTitle>
              <CardDescription>
                Configure your AR/VR preferences
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
                        if (setting.key === 'arVrEnabled') {
                          handleToggleARVR(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AR/VR Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AR/VR Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.arVrGoals?.map((goal) => (
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
              <ARVRDevice className="w-5 h-5" />
              <span className="text-sm">Launch Experience</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <VR className="w-5 h-5" />
              <span className="text-sm">Start VR</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <AR className="w-5 h-5" />
              <span className="text-sm">Start AR</span>
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
