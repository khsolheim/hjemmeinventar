'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  Settings,
  BarChart3,
  PieChart,
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
  Zap,
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
  EyeOff,
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
  Clock,
  Target,
  MessageSquare,
  Phone,
  FileText,
  Music,
  Video,
  Gamepad2
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedSecurityProps {
  className?: string
}

export function AdvancedSecurity({ className }: AdvancedSecurityProps) {
  const [selectedTab, setSelectedTab] = useState<'threats' | 'privacy' | 'access' | 'settings'>('threats')
  const [isScanning, setIsScanning] = useState(false)
  const [securityEnabled, setSecurityEnabled] = useState(true)
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Security queries
  const threatsQuery = trpc.security.getThreatsData.useQuery()
  const privacyQuery = trpc.security.getPrivacyData.useQuery()
  const accessQuery = trpc.security.getAccessData.useQuery()
  const settingsQuery = trpc.security.getSecuritySettings.useQuery()

  const scanSystemMutation = trpc.security.scanSystem.useMutation()
  const updatePrivacyMutation = trpc.security.updatePrivacy.useMutation()
  const manageAccessMutation = trpc.security.manageAccess.useMutation()
  const updateSettingsMutation = trpc.security.updateSettings.useMutation()

  const handleScanSystem = async () => {
    try {
      setIsScanning(true)
      haptic.selection()

      const result = await scanSystemMutation.mutateAsync()

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to scan system:', error)
      haptic.error()
    } finally {
      setIsScanning(false)
    }
  }

  const handleUpdatePrivacy = async (privacyData: any) => {
    try {
      haptic.selection()

      const result = await updatePrivacyMutation.mutateAsync(privacyData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to update privacy:', error)
      haptic.error()
    }
  }

  const handleManageAccess = async (accessData: any) => {
    try {
      haptic.selection()

      const result = await manageAccessMutation.mutateAsync(accessData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to manage access:', error)
      haptic.error()
    }
  }

  const handleToggleSecurity = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ securityEnabled: enabled })
      setSecurityEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle security:', error)
    }
  }

  const getThreatLevel = (level: string) => {
    switch (level) {
      case 'low': return { color: 'text-green-600', label: 'Low', icon: CheckCircle }
      case 'medium': return { color: 'text-yellow-600', label: 'Medium', icon: AlertTriangle }
      case 'high': return { color: 'text-red-600', label: 'High', icon: XCircle }
      case 'critical': return { color: 'text-red-800', label: 'Critical', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getAccessStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: UserCheck }
      case 'suspended': return { color: 'text-yellow-600', label: 'Suspended', icon: UserX }
      case 'blocked': return { color: 'text-red-600', label: 'Blocked', icon: Lock }
      case 'pending': return { color: 'text-blue-600', label: 'Pending', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Security</h2>
          <p className="text-muted-foreground">
            Threat detection, privacy controls og access management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Security Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            System Protected
          </Badge>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {settingsQuery.data?.securityScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall protection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {threatsQuery.data?.activeThreats || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Detected today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privacy Score</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {privacyQuery.data?.privacyScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Data protection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {accessQuery.data?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently online
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
          <AlertTriangle className="w-4 h-4 mr-2" />
          Threats
        </Button>
        <Button
          variant={selectedTab === 'privacy' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('privacy')}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Privacy
        </Button>
        <Button
          variant={selectedTab === 'access' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('access')}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Access
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
          {/* Threat Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Threat Detection
              </CardTitle>
              <CardDescription>
                Monitor og respond to security threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatsQuery.data?.detectedThreats?.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <threat.icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{threat.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {threat.description} • {threat.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{threat.source}</div>
                        <div className="text-xs text-muted-foreground">
                          {threat.date}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleScanSystem()}
                        variant="outline"
                        size="sm"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>

                      <Badge variant={threat.level === 'high' ? 'destructive' : 'secondary'}>
                        {threat.level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Security Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {threatsQuery.data?.securityAnalytics?.map((analytic) => (
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

      {/* Privacy Tab */}
      {selectedTab === 'privacy' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Privacy Controls
              </CardTitle>
              <CardDescription>
                Manage data privacy og protection settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {privacyQuery.data?.privacyControls?.map((control) => (
                  <div key={control.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <control.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{control.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {control.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{control.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {control.lastUpdated}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleUpdatePrivacy({ controlId: control.id, action: 'toggle' })}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Badge variant={control.enabled ? 'default' : 'secondary'}>
                        {control.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Privacy Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {privacyQuery.data?.privacyAnalytics?.map((analytic) => (
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

      {/* Access Tab */}
      {selectedTab === 'access' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Access Management
              </CardTitle>
              <CardDescription>
                Manage user access og permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessQuery.data?.userAccess?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <user.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.role} • {user.lastLogin}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{user.permissions}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.device}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleManageAccess({ userId: user.id, action: 'manage' })}
                        variant="outline"
                        size="sm"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>

                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Access Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Access Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {accessQuery.data?.accessAnalytics?.map((analytic) => (
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
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure your security preferences
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
                        if (setting.key === 'securityEnabled') {
                          handleToggleSecurity(enabled)
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
              <Shield className="w-5 h-5" />
              <span className="text-sm">Scan System</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">Privacy Check</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Manage Access</span>
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
