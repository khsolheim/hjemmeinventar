'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Download,
  Share2,
  Settings,
  Eye,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Save,
  FileText,
  Database,
  Activity,
  Users,
  DollarSign,
  Package,
  MapPin,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles,
  BarChart3 as Chart,
  PieChart as Donut,
  LineChart as Trend,
  TrendingUp as Growth,
  TrendingDown as Decline,
  Calendar as Schedule,
  Clock as Time,
  Download as Export,
  Share2 as Share,
  Settings as Config,
  Eye as View,
  Filter as Search,
  RefreshCw as Update,
  Plus as Add,
  Edit as Modify,
  Trash2 as Delete,
  Save as Store,
  FileText as Document,
  Database as Storage,
  Activity as Monitor,
  Users as People,
  DollarSign as Money,
  Package as Box,
  MapPin as Location,
  Star as Favorite,
  Award as Prize,
  Trophy as Victory,
  Crown as King,
  Rocket as Launch,
  Sparkles as Magic,
  BarChart3 as Graph,
  PieChart as Circle,
  LineChart as Line,
  TrendingUp as Rise,
  TrendingDown as Fall,
  Calendar as Date,
  Clock as Timer,
  Download as Get,
  Share2 as Send,
  Settings as Setup,
  Eye as See,
  Filter as Sort,
  RefreshCw as Reload,
  Plus as Create,
  Edit as Change,
  Trash2 as Remove,
  Save as Keep,
  FileText as Report,
  Database as Data,
  Activity as Track,
  Users as Group,
  DollarSign as Cash,
  Package as Item,
  MapPin as Place,
  Star as Rate,
  Award as Win,
  Trophy as Success,
  Crown as Leader,
  Rocket as Boost,
  Sparkles as Shine
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedReportingProps {
  className?: string
}

export function AdvancedReporting({ className }: AdvancedReportingProps) {
  const [selectedTab, setSelectedTab] = useState<'dashboards' | 'reports' | 'analytics' | 'insights'>('dashboards')
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const haptic = useHapticFeedback()

  // Reporting queries
  const dashboardsQuery = trpc.reporting.getDashboards.useQuery()
  const reportsQuery = trpc.reporting.getReports.useQuery({ timeRange: selectedTimeRange })
  const analyticsQuery = trpc.reporting.getAnalytics.useQuery({ timeRange: selectedTimeRange })
  const insightsQuery = trpc.reporting.getInsights.useQuery({ timeRange: selectedTimeRange })

  const createReportMutation = trpc.reporting.createReport.useMutation()
  const exportDataMutation = trpc.reporting.exportData.useMutation()
  const shareReportMutation = trpc.reporting.shareReport.useMutation()

  const handleCreateReport = async (reportData: any) => {
    haptic.success()
    try {
      await createReportMutation.mutateAsync(reportData)
    } catch (error) {
      console.error('Failed to create report:', error)
    }
  }

  const handleExportData = async (format: string) => {
    haptic.light()
    try {
      await exportDataMutation.mutateAsync({ format, timeRange: selectedTimeRange })
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const handleShareReport = async (reportId: string) => {
    haptic.selection()
    try {
      await shareReportMutation.mutateAsync({ reportId })
    } catch (error) {
      console.error('Failed to share report:', error)
    }
  }

  const getReportStatus = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'text-green-600', label: 'Fullført', icon: TrendingUp }
      case 'processing': return { color: 'text-yellow-600', label: 'Prosesserer', icon: Clock }
      case 'failed': return { color: 'text-red-600', label: 'Feilet', icon: TrendingDown }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: BarChart3 }
    }
  }

  const getInsightPriority = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-100 text-red-800', icon: TrendingUp }
      case 'medium': return { color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp }
      case 'low': return { color: 'bg-green-100 text-green-800', icon: TrendingDown }
      default: return { color: 'bg-gray-100 text-gray-800', icon: BarChart3 }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Reporting</h2>
          <p className="text-muted-foreground">
            Custom dashboards, data visualization og business intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            BI Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Real-time
          </Badge>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Tidsperiode:</span>
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={selectedTimeRange === '7d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeRange('7d')}
          >
            7 dager
          </Button>
          <Button
            variant={selectedTimeRange === '30d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeRange('30d')}
          >
            30 dager
          </Button>
          <Button
            variant={selectedTimeRange === '90d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeRange('90d')}
          >
            90 dager
          </Button>
          <Button
            variant={selectedTimeRange === '1y' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeRange('1y')}
          >
            1 år
          </Button>
        </div>
      </div>

      {/* Reporting Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Dashboards</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardsQuery.data?.activeDashboards || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Konfigurerte dashboards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genererte Rapporter</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reportsQuery.data?.totalReports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Siste {selectedTimeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsQuery.data?.totalDataPoints || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Analyserte datapunkter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Sparkles className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {insightsQuery.data?.totalInsights || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Genererte insights
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
          <BarChart3 className="w-4 h-4 mr-2" />
          Dashboards
        </Button>
        <Button
          variant={selectedTab === 'reports' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('reports')}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Rapporter
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('analytics')}
          className="flex-1"
        >
          <Database className="w-4 h-4 mr-2" />
          Analytics
        </Button>
        <Button
          variant={selectedTab === 'insights' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('insights')}
          className="flex-1"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Insights
        </Button>
      </div>

      {/* Dashboards Tab */}
      {selectedTab === 'dashboards' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Custom Dashboards
              </CardTitle>
              <CardDescription>
                Konfigurerbare dashboards og visualiseringer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardsQuery.data?.dashboards?.map((dashboard) => (
                  <div key={dashboard.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{dashboard.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {dashboard.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{dashboard.widgets} widgets</div>
                        <div className="text-xs text-muted-foreground">
                          Sist oppdatert: {dashboard.lastUpdated}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={dashboard.isPublic ? 'default' : 'secondary'}>
                          {dashboard.isPublic ? 'Offentlig' : 'Privat'}
                        </Badge>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
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
                <FileText className="w-5 h-5" />
                Generated Reports
              </CardTitle>
              <CardDescription>
                Automatisk genererte og manuelle rapporter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportsQuery.data?.reports?.map((report) => {
                  const status = getReportStatus(report.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.type} • {report.format}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{report.size}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.createdAt}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={status.color.replace('text-', 'bg-').replace('-600', '-100') + ' ' + status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          
                          <Button variant="outline" size="sm" onClick={() => handleExportData(report.format)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleShareReport(report.id)}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsQuery.data?.analytics?.map((analytic) => (
                    <div key={analytic.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{analytic.name}</span>
                        <span className="text-sm font-medium">{analytic.value}</span>
                      </div>
                      <Progress value={analytic.percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {analytic.trend > 0 ? '+' : ''}{analytic.trend}% fra forrige periode
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Visualization Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Visualization Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm">Bar Chart</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <PieChart className="w-5 h-5" />
                    <span className="text-sm">Pie Chart</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <LineChart className="w-5 h-5" />
                    <span className="text-sm">Line Chart</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">Trend Chart</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {selectedTab === 'insights' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>
                Automatisk genererte insights og anbefalinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsQuery.data?.insights?.map((insight) => {
                  const priority = getInsightPriority(insight.priority)
                  const PriorityIcon = priority.icon
                  
                  return (
                    <div key={insight.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium">{insight.title}</div>
                          <Badge className={priority.color}>
                            <PriorityIcon className="w-3 h-3 mr-1" />
                            {insight.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {insight.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {insight.confidence}% • Generated: {insight.generatedAt}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
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
              <Plus className="w-5 h-5" />
              <span className="text-sm">New Dashboard</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Create Report</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Export Data</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
