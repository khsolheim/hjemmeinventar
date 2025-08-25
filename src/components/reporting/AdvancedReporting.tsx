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
  Activity as Analytics
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedReportingProps {
  className?: string
}

export function AdvancedReporting({ className }: AdvancedReportingProps) {
  const [selectedTab, setSelectedTab] = useState<'dashboards' | 'reports' | 'analytics' | 'settings'>('dashboards')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportingEnabled, setReportingEnabled] = useState(true)
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Reporting queries
  const dashboardsQuery = trpc.reporting.getDashboardsData.useQuery()
  const reportsQuery = trpc.reporting.getReportsData.useQuery()
  const analyticsQuery = trpc.reporting.getAnalyticsData.useQuery()
  const settingsQuery = trpc.reporting.getReportingSettings.useQuery()

  const createDashboardMutation = trpc.reporting.createDashboard.useMutation()
  const generateReportMutation = trpc.reporting.generateReport.useMutation()
  const exportDataMutation = trpc.reporting.exportData.useMutation()
  const updateSettingsMutation = trpc.reporting.updateSettings.useMutation()

  const handleCreateDashboard = async (dashboardData: any) => {
    try {
      setIsGenerating(true)
      haptic.selection()

      const result = await createDashboardMutation.mutateAsync(dashboardData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to create dashboard:', error)
      haptic.error()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateReport = async (reportData: any) => {
    try {
      haptic.selection()

      const result = await generateReportMutation.mutateAsync(reportData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      haptic.error()
    }
  }

  const handleExportData = async (exportData: any) => {
    try {
      haptic.selection()

      const result = await exportDataMutation.mutateAsync(exportData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      haptic.error()
    }
  }

  const handleToggleReporting = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ reportingEnabled: enabled })
      setReportingEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle reporting:', error)
    }
  }

  const getDashboardStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: CheckCircle }
      case 'draft': return { color: 'text-yellow-600', label: 'Draft', icon: Edit }
      case 'archived': return { color: 'text-gray-600', label: 'Archived', icon: Archive }
      case 'error': return { color: 'text-red-600', label: 'Error', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getReportStatus = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'text-green-600', label: 'Completed', icon: CheckCircle }
      case 'generating': return { color: 'text-blue-600', label: 'Generating', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'scheduled': return { color: 'text-purple-600', label: 'Scheduled', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Reporting</h2>
          <p className="text-muted-foreground">
            Custom dashboards, report generation og data analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Reporting Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Analytics className="w-3 h-3" />
            Analytics Ready
          </Badge>
        </div>
      </div>

      {/* Reporting Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dashboards</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardsQuery.data?.activeDashboards || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Custom dashboards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Reports</CardTitle>
            <Report className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reportsQuery.data?.totalReports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Analytics</CardTitle>
            <Analytics className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsQuery.data?.analyticsScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Analytics accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Volume</CardTitle>
            <Export className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reportsQuery.data?.exportVolume || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Files exported
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'dashboards' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('dashboards')}
          className="flex-1"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboards
        </Button>
        <Button
          variant={selectedTab === 'reports' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('reports')}
          className="flex-1"
        >
          <Report className="w-4 h-4 mr-2" />
          Reports
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('analytics')}
          className="flex-1"
        >
          <Analytics className="w-4 h-4 mr-2" />
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

      {/* Dashboards Tab */}
      {selectedTab === 'dashboards' && (
        <div className="space-y-4">
          {/* Custom Dashboards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Custom Dashboards
              </CardTitle>
              <CardDescription>
                Create og manage custom dashboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardsQuery.data?.dashboards?.map((dashboard) => (
                  <div key={dashboard.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <dashboard.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{dashboard.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {dashboard.description} • {dashboard.widgets} widgets
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{dashboard.lastUpdated}</div>
                        <div className="text-xs text-muted-foreground">
                          {dashboard.views} views
                        </div>
                      </div>

                      <Button
                        onClick={() => handleCreateDashboard({ dashboardId: dashboard.id, action: 'edit' })}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Badge variant={dashboard.status === 'active' ? 'default' : 'secondary'}>
                        {dashboard.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dashboardsQuery.data?.dashboardAnalytics?.map((analytic) => (
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

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Report className="w-5 h-5" />
                Report Generation
              </CardTitle>
              <CardDescription>
                Generate og manage reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportsQuery.data?.reports?.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <report.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.description} • {report.format}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{report.lastGenerated}</div>
                        <div className="text-xs text-muted-foreground">
                          {report.size}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleGenerateReport({ reportId: report.id, action: 'generate' })}
                        variant="outline"
                        size="sm"
                      >
                        <Report className="w-4 h-4" />
                      </Button>

                      <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Report Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportsQuery.data?.reportAnalytics?.map((analytic) => (
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

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Analytics className="w-5 h-5" />
                Data Analytics
              </CardTitle>
              <CardDescription>
                Advanced data analysis og visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsQuery.data?.analyticsTools?.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <tool.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {tool.description} • {tool.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{tool.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">
                          {tool.lastRun}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleExportData({ toolId: tool.id, action: 'analyze' })}
                        variant="outline"
                        size="sm"
                      >
                        <Analytics className="w-4 h-4" />
                      </Button>

                      <Badge variant={tool.status === 'active' ? 'default' : 'secondary'}>
                        {tool.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analyticsQuery.data?.analyticsInsights?.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <insight.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="font-medium">{insight.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {insight.value}
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
                Reporting Settings
              </CardTitle>
              <CardDescription>
                Configure your reporting preferences
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
                        if (setting.key === 'reportingEnabled') {
                          handleToggleReporting(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reporting Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Reporting Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.reportingGoals?.map((goal) => (
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
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm">Create Dashboard</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Report className="w-5 h-5" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Analytics className="w-5 h-5" />
              <span className="text-sm">Run Analytics</span>
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
