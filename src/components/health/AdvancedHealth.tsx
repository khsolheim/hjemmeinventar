'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Heart,
  Activity,
  Target,
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
  Heart as Pulse,
  Activity as Fitness,
  Target as Goal,
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
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Target as Aim,
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
  Bookmark,
  Tag,
  Hash,
  AtSign,
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
  MessageSquare,
  MessageCircle,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Droplets,
  Thermometer,
  Scale,
  Bed,
  Coffee,
  Utensils,
  Dumbbell,
  Running,
  Bike,
  Swimming,
  Yoga,
  Meditation,
  Pill,
  Stethoscope,
  Brain,
  Eye,
  Ear,
  Tooth,
  Bone,
  Muscle,
  Lung,
  Liver,
  Kidney,
  Stomach,
  Brain as Mind,
  Eye as Vision,
  Ear as Hearing,
  Tooth as Dental,
  Bone as Skeleton,
  Muscle as Strength,
  Lung as Breathing,
  Liver as Detox,
  Kidney as Filter,
  Stomach as Digestion
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedHealthProps {
  className?: string
}

export function AdvancedHealth({ className }: AdvancedHealthProps) {
  const [selectedTab, setSelectedTab] = useState<'wellness' | 'fitness' | 'monitoring' | 'settings'>('wellness')
  const [isTracking, setIsTracking] = useState(false)
  const [healthEnabled, setHealthEnabled] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Health queries
  const wellnessQuery = trpc.health.getWellnessData.useQuery()
  const fitnessQuery = trpc.health.getFitnessData.useQuery()
  const monitoringQuery = trpc.health.getHealthMonitoring.useQuery()
  const settingsQuery = trpc.health.getHealthSettings.useQuery()

  const startTrackingMutation = trpc.health.startTracking.useMutation()
  const logWorkoutMutation = trpc.health.logWorkout.useMutation()
  const updateMetricMutation = trpc.health.updateMetric.useMutation()
  const updateSettingsMutation = trpc.health.updateSettings.useMutation()

  const handleStartTracking = async (metricId: string) => {
    try {
      setIsTracking(true)
      haptic.selection()

      const result = await startTrackingMutation.mutateAsync({
        metricId
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start tracking:', error)
      haptic.error()
    } finally {
      setIsTracking(false)
    }
  }

  const handleLogWorkout = async (workoutId: string) => {
    try {
      haptic.selection()

      const result = await logWorkoutMutation.mutateAsync({
        workoutId
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to log workout:', error)
      haptic.error()
    }
  }

  const handleUpdateMetric = async (metricId: string, value: number) => {
    try {
      haptic.selection()

      const result = await updateMetricMutation.mutateAsync({
        metricId,
        value
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to update metric:', error)
      haptic.error()
    }
  }

  const handleToggleHealth = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ healthEnabled: enabled })
      setHealthEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle health:', error)
    }
  }

  const getHealthStatus = (status: string) => {
    switch (status) {
      case 'excellent': return { color: 'text-green-600', label: 'Excellent', icon: Heart }
      case 'good': return { color: 'text-blue-600', label: 'Good', icon: CheckCircle }
      case 'fair': return { color: 'text-yellow-600', label: 'Fair', icon: AlertTriangle }
      case 'poor': return { color: 'text-red-600', label: 'Poor', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getFitnessLevel = (level: number) => {
    if (level >= 90) return { color: 'text-purple-600', label: 'Elite', icon: Crown }
    if (level >= 70) return { color: 'text-blue-600', label: 'Advanced', icon: Trophy }
    if (level >= 50) return { color: 'text-green-600', label: 'Intermediate', icon: Award }
    if (level >= 30) return { color: 'text-yellow-600', label: 'Beginner', icon: Star }
    return { color: 'text-gray-600', label: 'Novice', icon: Target }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Health</h2>
          <p className="text-muted-foreground">
            Wellness tracking, health monitoring og fitness integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            Health Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Fitness Active
          </Badge>
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
            <Heart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {wellnessQuery.data?.wellnessScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall wellness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fitness Level</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {fitnessQuery.data?.fitnessLevel || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Fitness performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Metrics</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {monitoringQuery.data?.activeMetrics || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Metrics tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Streak</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.healthStreak || 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              Active tracking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'wellness' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('wellness')}
          className="flex-1"
        >
          <Heart className="w-4 h-4 mr-2" />
          Wellness
        </Button>
        <Button
          variant={selectedTab === 'fitness' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('fitness')}
          className="flex-1"
        >
          <Activity className="w-4 h-4 mr-2" />
          Fitness
        </Button>
        <Button
          variant={selectedTab === 'monitoring' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('monitoring')}
          className="flex-1"
        >
          <Target className="w-4 h-4 mr-2" />
          Monitoring
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

      {/* Wellness Tab */}
      {selectedTab === 'wellness' && (
        <div className="space-y-4">
          {/* Wellness Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Wellness Metrics
              </CardTitle>
              <CardDescription>
                Track your overall wellness og health indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wellnessQuery.data?.metrics?.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <metric.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">
                          {metric.unit}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartTracking(metric.id)}
                        variant="outline"
                        size="sm"
                      >
                        Track
                      </Button>

                      <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wellness Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Wellness Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wellnessQuery.data?.categories?.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <category.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.score}% score
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fitness Tab */}
      {selectedTab === 'fitness' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Fitness Tracking
              </CardTitle>
              <CardDescription>
                Track workouts og fitness activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fitnessQuery.data?.workouts?.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <workout.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{workout.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workout.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{workout.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {workout.calories} calories
                        </div>
                      </div>

                      <Button
                        onClick={() => handleLogWorkout(workout.id)}
                        variant="outline"
                        size="sm"
                      >
                        Log
                      </Button>

                      <Badge variant={workout.completed ? 'default' : 'secondary'}>
                        {workout.completed ? 'Completed' : 'Not Done'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fitness Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Fitness Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fitnessQuery.data?.fitnessAnalytics?.map((analytic) => (
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

      {/* Monitoring Tab */}
      {selectedTab === 'monitoring' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Health Monitoring
              </CardTitle>
              <CardDescription>
                Monitor health metrics og vital signs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoringQuery.data?.vitals?.map((vital) => (
                  <div key={vital.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <vital.icon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{vital.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {vital.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{vital.value}</div>
                        <div className="text-xs text-muted-foreground">
                          {vital.unit}
                        </div>
                      </div>

                      <Progress value={vital.percentage} className="w-20" />

                      <Button
                        onClick={() => handleUpdateMetric(vital.id, vital.value + 1)}
                        variant="outline"
                        size="sm"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Monitoring Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoringQuery.data?.monitoringAnalytics?.map((analytic) => (
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

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Health Settings
              </CardTitle>
              <CardDescription>
                Configure health tracking preferences
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
                        if (setting.key === 'healthEnabled') {
                          handleToggleHealth(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Health Preferences
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
              <Heart className="w-5 h-5" />
              <span className="text-sm">Track Wellness</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm">Log Workout</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">Update Metrics</span>
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
