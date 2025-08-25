'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
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
  BookOpen as Learn,
  GraduationCap as Study,
  Lightbulb as Idea,
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
  Activity,
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
  Heart,
  HeartOff,
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
  UserX
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedLearningProps {
  className?: string
}

export function AdvancedLearning({ className }: AdvancedLearningProps) {
  const [selectedTab, setSelectedTab] = useState<'knowledge' | 'skills' | 'content' | 'settings'>('knowledge')
  const [isLearning, setIsLearning] = useState(false)
  const [learningEnabled, setLearningEnabled] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Learning queries
  const knowledgeQuery = trpc.learning.getKnowledgeBase.useQuery()
  const skillsQuery = trpc.learning.getSkillsDevelopment.useQuery()
  const contentQuery = trpc.learning.getEducationalContent.useQuery()
  const settingsQuery = trpc.learning.getLearningSettings.useQuery()

  const startLearningMutation = trpc.learning.startLearning.useMutation()
  const completeCourseMutation = trpc.learning.completeCourse.useMutation()
  const updateSkillMutation = trpc.learning.updateSkill.useMutation()
  const updateSettingsMutation = trpc.learning.updateSettings.useMutation()

  const handleStartLearning = async (courseId: string) => {
    try {
      setIsLearning(true)
      haptic.selection()

      const result = await startLearningMutation.mutateAsync({
        courseId
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start learning:', error)
      haptic.error()
    } finally {
      setIsLearning(false)
    }
  }

  const handleCompleteCourse = async (courseId: string) => {
    try {
      haptic.selection()

      const result = await completeCourseMutation.mutateAsync({
        courseId
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to complete course:', error)
      haptic.error()
    }
  }

  const handleUpdateSkill = async (skillId: string, level: number) => {
    try {
      haptic.selection()

      const result = await updateSkillMutation.mutateAsync({
        skillId,
        level
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to update skill:', error)
      haptic.error()
    }
  }

  const handleToggleLearning = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ learningEnabled: enabled })
      setLearningEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle learning:', error)
    }
  }

  const getLearningStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: BookOpen }
      case 'completed': return { color: 'text-blue-600', label: 'Completed', icon: CheckCircle }
      case 'pending': return { color: 'text-yellow-600', label: 'Pending', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: AlertTriangle }
    }
  }

  const getSkillLevel = (level: number) => {
    if (level >= 90) return { color: 'text-purple-600', label: 'Expert', icon: Crown }
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
          <h2 className="text-2xl font-bold">Advanced Learning</h2>
          <p className="text-muted-foreground">
            Knowledge management, skill development og educational content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Learning Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            Skills Active
          </Badge>
        </div>
      </div>

      {/* Learning Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {knowledgeQuery.data?.totalArticles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Articles available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Developed</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {skillsQuery.data?.totalSkills || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Skills mastered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {contentQuery.data?.completedCourses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Courses finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.learningScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Learning progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'knowledge' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('knowledge')}
          className="flex-1"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Knowledge
        </Button>
        <Button
          variant={selectedTab === 'skills' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('skills')}
          className="flex-1"
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          Skills
        </Button>
        <Button
          variant={selectedTab === 'content' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('content')}
          className="flex-1"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Content
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

      {/* Knowledge Tab */}
      {selectedTab === 'knowledge' && (
        <div className="space-y-4">
          {/* Knowledge Base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Knowledge Base
              </CardTitle>
              <CardDescription>
                Access educational articles og tutorials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledgeQuery.data?.articles?.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {article.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{article.category}</div>
                        <div className="text-xs text-muted-foreground">
                          {article.readTime} min read
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartLearning(article.id)}
                        variant="outline"
                        size="sm"
                      >
                        Read
                      </Button>

                      <Badge variant={article.status === 'read' ? 'default' : 'secondary'}>
                        {article.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Knowledge Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {knowledgeQuery.data?.categories?.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <category.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.articleCount} articles
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Skills Tab */}
      {selectedTab === 'skills' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Skills Development
              </CardTitle>
              <CardDescription>
                Track skill progress og development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillsQuery.data?.skills?.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {skill.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{skill.level}%</div>
                        <div className="text-xs text-muted-foreground">
                          {getSkillLevel(skill.level).label}
                        </div>
                      </div>

                      <Progress value={skill.level} className="w-20" />

                      <Button
                        onClick={() => handleUpdateSkill(skill.id, Math.min(skill.level + 10, 100))}
                        variant="outline"
                        size="sm"
                      >
                        Improve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Skills Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skillsQuery.data?.skillsAnalytics?.map((analytic) => (
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

      {/* Content Tab */}
      {selectedTab === 'content' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Educational Content
              </CardTitle>
              <CardDescription>
                Interactive courses og learning materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentQuery.data?.courses?.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{course.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {course.lessons} lessons
                        </div>
                      </div>

                      <Button
                        onClick={() => handleCompleteCourse(course.id)}
                        variant={course.completed ? 'outline' : 'default'}
                        size="sm"
                      >
                        {course.completed ? 'Completed' : 'Start'}
                      </Button>

                      <Badge variant={course.completed ? 'default' : 'secondary'}>
                        {course.completed ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Content Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentQuery.data?.contentAnalytics?.map((analytic) => (
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
                Learning Settings
              </CardTitle>
              <CardDescription>
                Configure learning preferences
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
                        if (setting.key === 'learningEnabled') {
                          handleToggleLearning(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Learning Preferences
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
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">Read Article</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm">Practice Skill</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm">Start Course</span>
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
