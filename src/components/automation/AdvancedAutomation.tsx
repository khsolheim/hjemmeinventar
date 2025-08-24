'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Zap,
  Workflow,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Clock,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
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
  Database,
  Network,
  Globe,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  AlertTriangle as Warning,
  CheckCircle as Success,
  XCircle as Error,
  Clock as Time,
  Calendar as Schedule,
  Activity as Monitor,
  TrendingUp as Growth,
  TrendingDown as Decline,
  Info as Details,
  Star as Favorite,
  Award as Achievement,
  Trophy as Victory,
  Crown as Leader,
  Rocket as Launch,
  Sparkles as Magic,
  Database as Storage,
  Network as Connection,
  Globe as World,
  Shield as Protection,
  Lock as Secure,
  Unlock as Open,
  Eye as View,
  EyeOff as Hide,
  Key as Access,
  Fingerprint as Identity,
  AlertTriangle as Notice,
  CheckCircle as Done,
  XCircle as Cancel,
  Clock as Timer,
  Calendar as Date,
  Activity as Track,
  TrendingUp as Rise,
  TrendingDown as Fall,
  Info as Help,
  Star as Rate,
  Award as Prize,
  Trophy as Win,
  Crown as King,
  Rocket as Boost,
  Sparkles as Shine,
  Database as Data,
  Network as Net,
  Globe as Earth,
  Shield as Guard,
  Lock as Key,
  Unlock as Free,
  Eye as See,
  EyeOff as Blind,
  Key as Secret,
  Fingerprint as Bio
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedAutomationProps {
  className?: string
}

export function AdvancedAutomation({ className }: AdvancedAutomationProps) {
  const [selectedTab, setSelectedTab] = useState<'workflows' | 'enterprise' | 'api' | 'performance'>('workflows')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const haptic = useHapticFeedback()

  // Automation queries
  const workflowsQuery = trpc.automation.getWorkflows.useQuery()
  const enterpriseQuery = trpc.automation.getEnterpriseFeatures.useQuery()
  const apiQuery = trpc.automation.getAPIManagement.useQuery()
  const performanceQuery = trpc.automation.getPerformanceMetrics.useQuery()

  const createWorkflowMutation = trpc.automation.createWorkflow.useMutation()
  const toggleAutomationMutation = trpc.automation.toggleAutomation.useMutation()
  const optimizePerformanceMutation = trpc.automation.optimizePerformance.useMutation()

  const handleCreateWorkflow = async (workflowData: any) => {
    haptic.success()
    try {
      await createWorkflowMutation.mutateAsync(workflowData)
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  const handleToggleAutomation = async (automationId: string, enabled: boolean) => {
    haptic.light()
    try {
      await toggleAutomationMutation.mutateAsync({ automationId, enabled })
    } catch (error) {
      console.error('Failed to toggle automation:', error)
    }
  }

  const handleOptimizePerformance = async () => {
    haptic.selection()
    try {
      await optimizePerformanceMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to optimize performance:', error)
    }
  }

  const getWorkflowStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Aktiv', icon: CheckCircle }
      case 'paused': return { color: 'text-yellow-600', label: 'Pauset', icon: Pause }
      case 'error': return { color: 'text-red-600', label: 'Feil', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', label: 'Utmerket', icon: Trophy }
    if (score >= 80) return { color: 'text-blue-600', label: 'God', icon: Award }
    if (score >= 70) return { color: 'text-yellow-600', label: 'OK', icon: Star }
    return { color: 'text-red-600', label: 'Dårlig', icon: AlertTriangle }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Automation</h2>
          <p className="text-muted-foreground">
            Workflow automation, enterprise features og API management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Enterprise Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Workflow className="w-3 h-3" />
            Auto-Scale
          </Badge>
        </div>
      </div>

      {/* Automation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {workflowsQuery.data?.activeWorkflows || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Kjører automatiseringer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise Features</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enterpriseQuery.data?.enabledFeatures || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktiverte funksjoner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Network className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {apiQuery.data?.totalAPICalls || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Siste 24 timer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {performanceQuery.data?.overallScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System ytelse
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'workflows' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('workflows')}
          className="flex-1"
        >
          <Workflow className="w-4 h-4 mr-2" />
          Workflows
        </Button>
        <Button
          variant={selectedTab === 'enterprise' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('enterprise')}
          className="flex-1"
        >
          <Shield className="w-4 h-4 mr-2" />
          Enterprise
        </Button>
        <Button
          variant={selectedTab === 'api' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('api')}
          className="flex-1"
        >
          <Network className="w-4 h-4 mr-2" />
          API
        </Button>
        <Button
          variant={selectedTab === 'performance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('performance')}
          className="flex-1"
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance
        </Button>
      </div>

      {/* Workflows Tab */}
      {selectedTab === 'workflows' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Workflow Automation
              </CardTitle>
              <CardDescription>
                Automatiserte prosesser og workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowsQuery.data?.workflows?.map((workflow) => {
                  const status = getWorkflowStatus(workflow.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Workflow className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{workflow.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {workflow.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{workflow.executions} kjøringer</div>
                          <div className="text-xs text-muted-foreground">
                            Siste: {workflow.lastExecuted}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={status.color.replace('text-', 'bg-').replace('-600', '-100') + ' ' + status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          
                          <Switch
                            checked={workflow.status === 'active'}
                            onCheckedChange={(enabled) => handleToggleAutomation(workflow.id, enabled)}
                          />
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

      {/* Enterprise Tab */}
      {selectedTab === 'enterprise' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Enterprise Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Enterprise Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enterpriseQuery.data?.features?.map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{feature.name}</span>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(enabled) => handleToggleAutomation(feature.id, enabled)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Enterprise Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enterpriseQuery.data?.analytics?.map((metric) => (
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
          </div>
        </div>
      )}

      {/* API Tab */}
      {selectedTab === 'api' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                API Management
              </CardTitle>
              <CardDescription>
                API endpoints, rate limiting og monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiQuery.data?.endpoints?.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Network className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{endpoint.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {endpoint.method} {endpoint.path}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{endpoint.calls} calls</div>
                        <div className="text-xs text-muted-foreground">
                          {endpoint.responseTime}ms avg
                        </div>
                      </div>
                      
                      <Badge variant={endpoint.status === 'healthy' ? 'default' : 'secondary'}>
                        {endpoint.status === 'healthy' ? 'Sunn' : 'Problemer'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Tab */}
      {selectedTab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceQuery.data?.metrics?.map((metric) => {
                    const level = getPerformanceLevel(metric.score)
                    const LevelIcon = level.icon
                    
                    return (
                      <div key={metric.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <div className="flex items-center gap-1">
                            <LevelIcon className={`w-4 h-4 ${level.color}`} />
                            <span className={`text-sm font-medium ${level.color}`}>
                              {metric.score}%
                            </span>
                          </div>
                        </div>
                        <Progress value={metric.score} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Performance Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Performance Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceQuery.data?.recommendations?.map((recommendation) => (
                    <div key={recommendation.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <Rocket className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{recommendation.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {recommendation.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Performance Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={handleOptimizePerformance}>
                  <Rocket className="w-5 h-5" />
                  <span className="text-sm">Optimize</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm">Cache Clear</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Database className="w-5 h-5" />
                  <span className="text-sm">DB Optimize</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Network className="w-5 h-5" />
                  <span className="text-sm">CDN Sync</span>
                </Button>
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
              <Play className="w-5 h-5" />
              <span className="text-sm">Start All</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Pause className="w-5 h-5" />
              <span className="text-sm">Pause All</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Refresh</span>
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
