'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  CheckSquare,
  Clock,
  Target,
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
  Calendar as Schedule,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
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
  Bell,
  Mail,
  Phone,
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
  Sparkles
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedProductivityProps {
  className?: string
}

export function AdvancedProductivity({ className }: AdvancedProductivityProps) {
  const [selectedTab, setSelectedTab] = useState<'tasks' | 'time' | 'projects' | 'settings'>('tasks')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [productivityEnabled, setProductivityEnabled] = useState(true)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Productivity queries
  const tasksQuery = trpc.productivity.getTasksData.useQuery()
  const timeQuery = trpc.productivity.getTimeTrackingData.useQuery()
  const projectsQuery = trpc.productivity.getProjectsData.useQuery()
  const settingsQuery = trpc.productivity.getProductivitySettings.useQuery()

  const addTaskMutation = trpc.productivity.addTask.useMutation()
  const updateTaskMutation = trpc.productivity.updateTask.useMutation()
  const startTimeTrackingMutation = trpc.productivity.startTimeTracking.useMutation()
  const updateSettingsMutation = trpc.productivity.updateSettings.useMutation()

  const handleAddTask = async (taskData: any) => {
    try {
      setIsAddingTask(true)
      haptic.selection()

      const result = await addTaskMutation.mutateAsync(taskData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to add task:', error)
      haptic.error()
    } finally {
      setIsAddingTask(false)
    }
  }

  const handleUpdateTask = async (taskId: string, status: string) => {
    try {
      haptic.selection()

      const result = await updateTaskMutation.mutateAsync({
        taskId,
        status
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      haptic.error()
    }
  }

  const handleStartTimeTracking = async (taskId: string) => {
    try {
      haptic.selection()

      const result = await startTimeTrackingMutation.mutateAsync({
        taskId
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start time tracking:', error)
      haptic.error()
    }
  }

  const handleToggleProductivity = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ productivityEnabled: enabled })
      setProductivityEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle productivity:', error)
    }
  }

  const getTaskStatus = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'text-green-600', label: 'Completed', icon: CheckCircle }
      case 'in_progress': return { color: 'text-blue-600', label: 'In Progress', icon: Clock }
      case 'pending': return { color: 'text-yellow-600', label: 'Pending', icon: AlertTriangle }
      case 'overdue': return { color: 'text-red-600', label: 'Overdue', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getProjectProgress = (progress: number) => {
    if (progress >= 90) return { color: 'text-green-600', label: 'Almost Done', icon: CheckCircle }
    if (progress >= 70) return { color: 'text-blue-600', label: 'Good Progress', icon: TrendingUp }
    if (progress >= 50) return { color: 'text-yellow-600', label: 'Halfway', icon: Target }
    return { color: 'text-red-600', label: 'Just Started', icon: Play }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Productivity</h2>
          <p className="text-muted-foreground">
            Task management, time tracking og project management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckSquare className="w-3 h-3" />
            Productivity Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Time Tracking Active
          </Badge>
        </div>
      </div>

      {/* Productivity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasksQuery.data?.totalTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {timeQuery.data?.totalTimeTracked || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {projectsQuery.data?.activeProjects || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ongoing projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.productivityScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'tasks' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('tasks')}
          className="flex-1"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          Tasks
        </Button>
        <Button
          variant={selectedTab === 'time' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('time')}
          className="flex-1"
        >
          <Clock className="w-4 h-4 mr-2" />
          Time
        </Button>
        <Button
          variant={selectedTab === 'projects' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('projects')}
          className="flex-1"
        >
          <Target className="w-4 h-4 mr-2" />
          Projects
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

      {/* Tasks Tab */}
      {selectedTab === 'tasks' && (
        <div className="space-y-4">
          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Task Management
              </CardTitle>
              <CardDescription>
                Manage your tasks and track progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksQuery.data?.tasks?.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <task.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{task.priority}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: {task.dueDate}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartTimeTracking(task.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Task Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tasksQuery.data?.taskAnalytics?.map((analytic) => (
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

      {/* Time Tab */}
      {selectedTab === 'time' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Tracking
              </CardTitle>
              <CardDescription>
                Track your time and monitor productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeQuery.data?.timeEntries?.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <entry.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{entry.taskName}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.projectName} • {entry.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{entry.duration}h</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.startTime} - {entry.endTime}
                        </div>
                      </div>

                      <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeQuery.data?.timeAnalytics?.map((analytic) => (
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

      {/* Projects Tab */}
      {selectedTab === 'projects' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Management
              </CardTitle>
              <CardDescription>
                Manage your projects and track milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectsQuery.data?.projects?.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <project.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{project.progress}%</div>
                        <div className="text-xs text-muted-foreground">
                          {project.deadline}
                        </div>
                      </div>

                      <Progress value={project.progress} className="w-20" />

                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Project Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {projectsQuery.data?.projectAnalytics?.map((analytic) => (
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
                Productivity Settings
              </CardTitle>
              <CardDescription>
                Configure your productivity preferences
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
                        if (setting.key === 'productivityEnabled') {
                          handleToggleProductivity(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Productivity Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Productivity Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.productivityGoals?.map((goal) => (
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
              <Plus className="w-5 h-5" />
              <span className="text-sm">Add Task</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Play className="w-5 h-5" />
              <span className="text-sm">Start Timer</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">New Project</span>
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
