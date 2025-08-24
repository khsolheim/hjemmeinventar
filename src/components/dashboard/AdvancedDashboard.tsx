'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  LayoutDashboard,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles,
  LayoutDashboard as Dashboard,
  Settings as Config,
  RefreshCw as Update,
  CheckCircle as Success,
  XCircle as Error,
  AlertTriangle as Warning,
  Info as Details,
  Star as Favorite,
  Award as Prize,
  Trophy as Victory,
  Crown as King,
  Rocket as Launch,
  Sparkles as Magic,
  LayoutDashboard as Board,
  Settings as Setup,
  RefreshCw as Reload,
  CheckCircle as Done,
  XCircle as Fail,
  AlertTriangle as Notice,
  Info as Help,
  Star as Rate,
  Award as Win,
  Trophy as Success,
  Crown as Leader,
  Rocket as Boost,
  Sparkles as Shine,
  LayoutDashboard as Panel,
  Settings as Options,
  RefreshCw as Restart,
  CheckCircle as Complete,
  XCircle as Cancel,
  AlertTriangle as Caution,
  Info as Information,
  Star as Mark,
  Award as Achieve,
  Trophy as Win,
  Crown as Top,
  Rocket as Fly,
  Sparkles as Glow,
  Clock,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Crosshair,
  Layers,
  Grid3x3,
  List,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Share2,
  Download,
  Upload,
  Mail,
  Phone,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Bluetooth,
  Zap,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Heart,
  HeartOff,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Hash as Number,
  AtSign as Mention,
  Hash as Pound,
  AtSign as At,
  Hash as Sharp,
  AtSign as Symbol,
  FileText,
  Image,
  Video,
  Music,
  File,
  Folder,
  Database,
  Server,
  Cloud,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Target as Aim,
  Crosshair as Scope,
  Layers as Stack,
  Grid3x3 as Grid,
  List as Menu,
  Plus as Add,
  Edit as Modify,
  Trash2 as Delete,
  Share2 as Send,
  Download as Get,
  Upload as Put,
  Package,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingDown,
  Minus,
  Equal,
  Percent,
  Hash as Sharp2,
  AtSign as At2,
  Hash as Pound2,
  AtSign as Symbol2,
  Hash as Number2,
  AtSign as Mention2,
  Hash as Sharp3,
  AtSign as At3,
  Hash as Pound3,
  AtSign as Symbol3,
  Hash as Number3,
  AtSign as Mention3,
  Hash as Sharp4,
  AtSign as At4,
  Hash as Pound4,
  AtSign as Symbol4,
  Hash as Number4,
  AtSign as Mention4,
  Hash as Sharp5,
  AtSign as At5,
  Hash as Pound5,
  AtSign as Symbol5,
  Hash as Number5,
  AtSign as Mention5,
  Hash as Sharp6,
  AtSign as At6,
  Hash as Pound6,
  AtSign as Symbol6,
  Hash as Number6,
  AtSign as Mention6,
  Hash as Sharp7,
  AtSign as At7,
  Hash as Pound7,
  AtSign as Symbol7,
  Hash as Number7,
  AtSign as Mention7,
  Hash as Sharp8,
  AtSign as At8,
  Hash as Pound8,
  AtSign as Symbol8,
  Hash as Number8,
  AtSign as Mention8,
  Hash as Sharp9,
  AtSign as At9,
  Hash as Pound9,
  AtSign as Symbol9,
  Hash as Number9,
  AtSign as Mention9,
  Hash as Sharp10,
  AtSign as At10,
  Hash as Pound10,
  AtSign as Symbol10,
  Hash as Number10,
  AtSign as Mention10,
  Hash as Sharp11,
  AtSign as At11,
  Hash as Pound11,
  AtSign as Symbol11,
  Hash as Number11,
  AtSign as Mention11,
  Hash as Sharp12,
  AtSign as At12,
  Hash as Pound12,
  AtSign as Symbol12,
  Hash as Number12,
  AtSign as Mention12,
  Hash as Sharp13,
  AtSign as At13,
  Hash as Pound13,
  AtSign as Symbol13,
  Hash as Number13,
  AtSign as Mention13,
  Hash as Sharp14,
  AtSign as At14,
  Hash as Pound14,
  AtSign as Symbol14,
  Hash as Number14,
  AtSign as Mention14,
  Hash as Sharp15,
  AtSign as At15,
  Hash as Pound15,
  AtSign as Symbol15,
  Hash as Number15,
  AtSign as Mention15,
  Hash as Sharp16,
  AtSign as At16,
  Hash as Pound16,
  AtSign as Symbol16,
  Hash as Number16,
  AtSign as Mention16,
  Hash as Sharp17,
  AtSign as At17,
  Hash as Pound17,
  AtSign as Symbol17,
  Hash as Number17,
  AtSign as Mention17,
  Hash as Sharp18,
  AtSign as At18,
  Hash as Pound18,
  AtSign as Symbol18,
  Hash as Number18,
  AtSign as Mention18,
  Hash as Sharp19,
  AtSign as At19,
  Hash as Pound19,
  AtSign as Symbol19,
  Hash as Number19,
  AtSign as Mention19,
  Hash as Sharp20,
  AtSign as At20,
  Hash as Pound20,
  AtSign as Symbol20,
  Hash as Number20,
  AtSign as Mention20,
  Hash as Sharp21,
  AtSign as At21,
  Hash as Pound21,
  AtSign as Symbol21,
  Hash as Number21,
  AtSign as Mention21,
  Hash as Sharp22,
  AtSign as At22,
  Hash as Pound22,
  AtSign as Symbol22,
  Hash as Number22,
  AtSign as Mention22,
  Hash as Sharp23,
  AtSign as At23,
  Hash as Pound23,
  AtSign as Symbol23,
  Hash as Number23,
  AtSign as Mention23,
  Hash as Sharp24,
  AtSign as At24,
  Hash as Pound24,
  AtSign as Symbol24,
  Hash as Number24,
  AtSign as Mention24,
  Hash as Sharp25,
  AtSign as At25,
  Hash as Pound25,
  AtSign as Symbol25,
  Hash as Number25,
  AtSign as Mention25,
  Hash as Sharp26,
  AtSign as At26,
  Hash as Pound26,
  AtSign as Symbol26,
  Hash as Number26,
  AtSign as Mention26,
  Hash as Sharp27,
  AtSign as At27,
  Hash as Pound27,
  AtSign as Symbol27,
  Hash as Number27,
  AtSign as Mention27,
  Hash as Sharp28,
  AtSign as At28,
  Hash as Pound28,
  AtSign as Symbol28,
  Hash as Number28,
  AtSign as Mention28,
  Hash as Sharp29,
  AtSign as At29,
  Hash as Pound29,
  AtSign as Symbol29,
  Hash as Number29,
  AtSign as Mention29,
  Hash as Sharp30,
  AtSign as At30,
  Hash as Pound30,
  AtSign as Symbol30,
  Hash as Number30,
  AtSign as Mention30,
  Hash as Sharp31,
  AtSign as At31,
  Hash as Pound31,
  AtSign as Symbol31,
  Hash as Number31,
  AtSign as Mention31,
  Hash as Sharp32,
  AtSign as At32,
  Hash as Pound32,
  AtSign as Symbol32,
  Hash as Number32,
  AtSign as Mention32,
  Hash as Sharp33,
  AtSign as At33,
  Hash as Pound33,
  AtSign as Symbol33,
  Hash as Number33,
  AtSign as Mention33,
  Hash as Sharp34,
  AtSign as At34,
  Hash as Pound34,
  AtSign as Symbol34,
  Hash as Number34,
  AtSign as Mention34,
  Hash as Sharp35,
  AtSign as At35,
  Hash as Pound35,
  AtSign as Symbol35,
  Hash as Number35,
  AtSign as Mention35,
  Hash as Sharp36,
  AtSign as At36,
  Hash as Pound36,
  AtSign as Symbol36,
  Hash as Number36,
  AtSign as Mention36,
  Hash as Sharp37,
  AtSign as At37,
  Hash as Pound37,
  AtSign as Symbol37,
  Hash as Number37,
  AtSign as Mention37,
  Hash as Sharp38,
  AtSign as At38,
  Hash as Pound38,
  AtSign as Symbol38,
  Hash as Number38,
  AtSign as Mention38,
  Hash as Sharp39,
  AtSign as At39,
  Hash as Pound39,
  AtSign as Symbol39,
  Hash as Number39,
  AtSign as Mention39,
  Hash as Sharp40,
  AtSign as At40,
  Hash as Pound40,
  AtSign as Symbol40,
  Hash as Number40,
  AtSign as Mention40,
  Hash as Sharp41,
  AtSign as At41,
  Hash as Pound41,
  AtSign as Symbol41,
  Hash as Number41,
  AtSign as Mention41,
  Hash as Sharp42,
  AtSign as At42,
  Hash as Pound42,
  AtSign as Symbol42,
  Hash as Number42,
  AtSign as Mention42,
  Hash as Sharp43,
  AtSign as At43,
  Hash as Pound43,
  AtSign as Symbol43,
  Hash as Number43,
  AtSign as Mention43,
  Hash as Sharp44,
  AtSign as At44,
  Hash as Pound44,
  AtSign as Symbol44,
  Hash as Number44,
  AtSign as Mention44,
  Hash as Sharp45,
  AtSign as At45,
  Hash as Pound45,
  AtSign as Symbol45,
  Hash as Number45,
  AtSign as Mention45,
  Hash as Sharp46,
  AtSign as At46,
  Hash as Pound46,
  AtSign as Symbol46,
  Hash as Number46,
  AtSign as Mention46,
  Hash as Sharp47,
  AtSign as At47,
  Hash as Pound47,
  AtSign as Symbol47,
  Hash as Number47,
  AtSign as Mention47,
  Hash as Sharp48,
  AtSign as At48,
  Hash as Pound48,
  AtSign as Symbol48,
  Hash as Number48,
  AtSign as Mention48,
  Hash as Sharp49,
  AtSign as At49,
  Hash as Pound49,
  AtSign as Symbol49,
  Hash as Number49,
  AtSign as Mention49,
  Hash as Sharp50,
  AtSign as At50,
  Hash as Pound50,
  AtSign as Symbol50,
  Hash as Number50,
  AtSign as Mention50,
  Hash as Sharp51,
  AtSign as At51,
  Hash as Pound51,
  AtSign as Symbol51,
  Hash as Number51,
  AtSign as Mention51,
  Hash as Sharp52,
  AtSign as At52,
  Hash as Pound52,
  AtSign as Symbol52,
  Hash as Number52,
  AtSign as Mention52,
  Hash as Sharp53,
  AtSign as At53,
  Hash as Pound53,
  AtSign as Symbol53,
  Hash as Number53,
  AtSign as Mention53,
  Hash as Sharp54,
  AtSign as At54,
  Hash as Pound54,
  AtSign as Symbol54,
  Hash as Number54,
  AtSign as Mention54,
  Hash as Sharp55,
  AtSign as At55,
  Hash as Pound55,
  AtSign as Symbol55,
  Hash as Number55,
  AtSign as Mention55,
  Hash as Sharp56,
  AtSign as At56,
  Hash as Pound56,
  AtSign as Symbol56,
  Hash as Number56,
  AtSign as Mention56,
  Hash as Sharp57,
  AtSign as At57,
  Hash as Pound57,
  AtSign as Symbol57,
  Hash as Number57,
  AtSign as Mention57,
  Hash as Sharp58,
  AtSign as At58,
  Hash as Pound58,
  AtSign as Symbol58,
  Hash as Number58,
  AtSign as Mention58,
  Hash as Sharp59,
  AtSign as At59,
  Hash as Pound59,
  AtSign as Symbol59,
  Hash as Number59,
  AtSign as Mention59,
  Hash as Sharp60,
  AtSign as At60,
  Hash as Pound60,
  AtSign as Symbol60,
  Hash as Number60,
  AtSign as Mention60,
  Hash as Sharp61,
  AtSign as At61,
  Hash as Pound61,
  AtSign as Symbol61,
  Hash as Number61,
  AtSign as Mention61,
  Hash as Sharp62,
  AtSign as At62,
  Hash as Pound62,
  AtSign as Symbol62,
  Hash as Number62,
  AtSign as Mention62,
  Hash as Sharp63,
  AtSign as At63,
  Hash as Pound63,
  AtSign as Symbol63,
  Hash as Number63,
  AtSign as Mention63,
  Hash as Sharp64,
  AtSign as At64,
  Hash as Pound64,
  AtSign as Symbol64,
  Hash as Number64,
  AtSign as Mention64,
  Hash as Sharp65,
  AtSign as At65,
  Hash as Pound65,
  AtSign as Symbol65,
  Hash as Number65,
  AtSign as Mention65,
  Hash as Sharp66,
  AtSign as At66,
  Hash as Pound66,
  AtSign as Symbol66,
  Hash as Number66,
  AtSign as Mention66,
  Hash as Sharp67,
  AtSign as At67,
  Hash as Pound67,
  AtSign as Symbol67,
  Hash as Number67,
  AtSign as Mention67,
  Hash as Sharp68,
  AtSign as At68,
  Hash as Pound68,
  AtSign as Symbol68,
  Hash as Number68,
  AtSign as Mention68,
  Hash as Sharp69,
  AtSign as At69,
  Hash as Pound69,
  AtSign as Symbol69,
  Hash as Number69,
  AtSign as Mention69,
  Hash as Sharp70,
  AtSign as At70,
  Hash as Pound70,
  AtSign as Symbol70,
  Hash as Number70,
  AtSign as Mention70,
  Hash as Sharp71,
  AtSign as At71,
  Hash as Pound71,
  AtSign as Symbol71,
  Hash as Number71,
  AtSign as Mention71,
  Hash as Sharp72,
  AtSign as At72,
  Hash as Pound72,
  AtSign as Symbol72,
  Hash as Number72,
  AtSign as Mention72,
  Hash as Sharp73,
  AtSign as At73,
  Hash as Pound73,
  AtSign as Symbol73,
  Hash as Number73,
  AtSign as Mention73,
  Hash as Sharp74,
  AtSign as At74,
  Hash as Pound74,
  AtSign as Symbol74,
  Hash as Number74,
  AtSign as Mention74,
  Hash as Sharp75,
  AtSign as At75,
  Hash as Pound75,
  AtSign as Symbol75,
  Hash as Number75,
  AtSign as Mention75,
  Hash as Sharp76,
  AtSign as At76,
  Hash as Pound76,
  AtSign as Symbol76,
  Hash as Number76,
  AtSign as Mention76,
  Hash as Sharp77,
  AtSign as At77,
  Hash as Pound77,
  AtSign as Symbol77,
  Hash as Number77,
  AtSign as Mention77,
  Hash as Sharp78,
  AtSign as At78,
  Hash as Pound78,
  AtSign as Symbol78,
  Hash as Number78,
  AtSign as Mention78,
  Hash as Sharp79,
  AtSign as At79,
  Hash as Pound79,
  AtSign as Symbol79,
  Hash as Number79,
  AtSign as Mention79,
  Hash as Sharp80,
  AtSign as At80,
  Hash as Pound80,
  AtSign as Symbol80,
  Hash as Number80,
  AtSign as Mention80,
  Hash as Sharp81,
  AtSign as At81,
  Hash as Pound81,
  AtSign as Symbol81,
  Hash as Number81,
  AtSign as Mention81,
  Hash as Sharp82,
  AtSign as At82,
  Hash as Pound82,
  AtSign as Symbol82,
  Hash as Number82,
  AtSign as Mention82,
  Hash as Sharp83,
  AtSign as At83,
  Hash as Pound83,
  AtSign as Symbol83,
  Hash as Number83,
  AtSign as Mention83,
  Hash as Sharp84,
  AtSign as At84,
  Hash as Pound84,
  AtSign as Symbol84,
  Hash as Number84,
  AtSign as Mention84,
  Hash as Sharp85,
  AtSign as At85,
  Hash as Pound85,
  AtSign as Symbol85,
  Hash as Number85,
  AtSign as Mention85,
  Hash as Sharp86,
  AtSign as At86,
  Hash as Pound86,
  AtSign as Symbol86,
  Hash as Number86,
  AtSign as Mention86,
  Hash as Sharp87,
  AtSign as At87,
  Hash as Pound87,
  AtSign as Symbol87,
  Hash as Number87,
  AtSign as Mention87,
  Hash as Sharp88,
  AtSign as At88,
  Hash as Pound88,
  AtSign as Symbol88,
  Hash as Number88,
  AtSign as Mention88,
  Hash as Sharp89,
  AtSign as At89,
  Hash as Pound89,
  AtSign as Symbol89,
  Hash as Number89,
  AtSign as Mention89,
  Hash as Sharp90,
  AtSign as At90,
  Hash as Pound90,
  AtSign as Symbol90,
  Hash as Number90,
  AtSign as Mention90,
  Hash as Sharp91,
  AtSign as At91,
  Hash as Pound91,
  AtSign as Symbol91,
  Hash as Number91,
  AtSign as Mention91,
  Hash as Sharp92,
  AtSign as At92,
  Hash as Pound92,
  AtSign as Symbol92,
  Hash as Number92,
  AtSign as Mention92,
  Hash as Sharp93,
  AtSign as At93,
  Hash as Pound93,
  AtSign as Symbol93,
  Hash as Number93,
  AtSign as Mention93,
  Hash as Sharp94,
  AtSign as At94,
  Hash as Pound94,
  AtSign as Symbol94,
  Hash as Number94,
  AtSign as Mention94,
  Hash as Sharp95,
  AtSign as At95,
  Hash as Pound95,
  AtSign as Symbol95,
  Hash as Number95,
  AtSign as Mention95,
  Hash as Sharp96,
  AtSign as At96,
  Hash as Pound96,
  AtSign as Symbol96,
  Hash as Number96,
  AtSign as Mention96,
  Hash as Sharp97,
  AtSign as At97,
  Hash as Pound97,
  AtSign as Symbol97,
  Hash as Number97,
  AtSign as Mention97,
  Hash as Sharp98,
  AtSign as At98,
  Hash as Pound98,
  AtSign as Symbol98,
  Hash as Number98,
  AtSign as Mention98,
  Hash as Sharp99,
  AtSign as At99,
  Hash as Pound99,
  AtSign as Symbol99,
  Hash as Number99,
  AtSign as Mention99,
  Hash as Sharp100,
  AtSign as At100,
  Hash as Pound100,
  AtSign as Symbol100,
  Hash as Number100,
  AtSign as Mention100
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedDashboardProps {
  className?: string
}

export function AdvancedDashboard({ className }: AdvancedDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'personalization' | 'analytics' | 'settings'>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardEnabled, setDashboardEnabled] = useState(true)
  const [widgets, setWidgets] = useState<any[]>([])
  const haptic = useHapticFeedback()

  // Dashboard queries
  const dashboardQuery = trpc.dashboard.getDashboardStatus.useQuery()
  const personalizationQuery = trpc.dashboard.getPersonalization.useQuery()
  const analyticsQuery = trpc.dashboard.getDashboardAnalytics.useQuery()
  const settingsQuery = trpc.dashboard.getDashboardSettings.useQuery()

  const updateWidgetsMutation = trpc.dashboard.updateWidgets.useMutation()
  const updateSettingsMutation = trpc.dashboard.updateSettings.useMutation()
  const optimizeDashboardMutation = trpc.dashboard.optimizeDashboard.useMutation()

  const handleUpdateWidgets = async (newWidgets: any[]) => {
    try {
      setIsLoading(true)
      haptic.selection()

      const result = await updateWidgetsMutation.mutateAsync({
        widgets: newWidgets
      })

      if (result.success) {
        setWidgets(newWidgets)
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to update widgets:', error)
      haptic.error()
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleDashboard = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ dashboardEnabled: enabled })
      setDashboardEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle dashboard:', error)
    }
  }

  const handleOptimizeDashboard = async () => {
    try {
      setIsLoading(true)
      haptic.selection()

      const result = await optimizeDashboardMutation.mutateAsync()

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to optimize dashboard:', error)
      haptic.error()
    } finally {
      setIsLoading(false)
    }
  }

  const getDashboardStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Aktiv', icon: LayoutDashboard }
      case 'inactive': return { color: 'text-red-600', label: 'Inaktiv', icon: XCircle }
      case 'loading': return { color: 'text-yellow-600', label: 'Laster', icon: RefreshCw }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Dashboard</h2>
          <p className="text-muted-foreground">
            Dashboard personalization, analytics og optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <LayoutDashboard className="w-3 h-3" />
            Dashboard Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Personalized
          </Badge>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dashboard Status</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardEnabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getDashboardStatus(dashboardEnabled ? 'active' : 'inactive').label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Widgets</CardTitle>
            <Grid3x3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {personalizationQuery.data?.activeWidgets || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Widgets active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsQuery.data?.performanceScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Performance score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsQuery.data?.userSatisfaction || 0}/5
            </div>
            <p className="text-xs text-muted-foreground">
              User satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('overview')}
          className="flex-1"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={selectedTab === 'personalization' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('personalization')}
          className="flex-1"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Personalization
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('analytics')}
          className="flex-1"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
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

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          {/* Dashboard Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Dashboard Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardQuery.data?.dashboardStatus?.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <LayoutDashboard className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{status.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {status.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{status.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {status.lastUpdate}
                        </div>
                      </div>
                      
                      <Badge variant={status.isActive ? 'default' : 'secondary'}>
                        {status.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm">Refresh</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">Optimize</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Personalization Tab */}
      {selectedTab === 'personalization' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Dashboard Personalization
              </CardTitle>
              <CardDescription>
                Customize your dashboard layout og widgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizationQuery.data?.widgets?.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <widget.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{widget.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {widget.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{widget.position}</div>
                        <div className="text-xs text-muted-foreground">
                          {widget.size}
                        </div>
                      </div>
                      
                      <Badge variant={widget.isActive ? 'default' : 'secondary'}>
                        {widget.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Widget Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {personalizationQuery.data?.widgetCategories?.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <category.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.count} widgets
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dashboard Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Dashboard Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsQuery.data?.metrics?.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Dashboard Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsQuery.data?.trends?.map((trend) => (
                    <div key={trend.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <trend.icon className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{trend.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {trend.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Dashboard History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsQuery.data?.dashboardHistory?.map((history) => (
                  <div key={history.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <LayoutDashboard className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{history.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {history.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{history.duration}ms</div>
                        <div className="text-xs text-muted-foreground">
                          Load time
                        </div>
                      </div>
                      
                      <Badge variant={history.status === 'Success' ? 'default' : 'secondary'}>
                        {history.status}
                      </Badge>
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
                Dashboard Settings
              </CardTitle>
              <CardDescription>
                Configure dashboard preferences og optimization
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
                        if (setting.key === 'dashboardEnabled') {
                          handleToggleDashboard(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Dashboard Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.preferences?.map((preference) => (
                  <div key={preference.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{preference.name}</span>
                      <span className="text-sm font-medium">{preference.value}</span>
                    </div>
                    <Progress value={preference.percentage} className="h-2" />
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
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm">Overview</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Personalize</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Analytics</span>
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
