'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Trophy,
  Award,
  Star,
  Crown,
  Medal,
  Target,
  Zap,
  Sparkles,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Trophy as Prize,
  Award as Achievement,
  Star as Rating,
  Crown as King,
  Medal as MedalIcon,
  Target as Goal,
  Zap as Lightning,
  Sparkles as Magic,
  Settings as Config,
  RefreshCw as Update,
  CheckCircle as Success,
  XCircle as Error,
  AlertTriangle as Warning,
  Info as Details,
  Trophy as Victory,
  Award as Win,
  Star as Favorite,
  Crown as Leader,
  Medal as Honor,
  Target as Aim,
  Zap as Power,
  Sparkles as Glow,
  Settings as Setup,
  RefreshCw as Reload,
  CheckCircle as Done,
  XCircle as Fail,
  AlertTriangle as Notice,
  Info as Help,
  Trophy as Champion,
  Award as Prize2,
  Star as Mark,
  Crown as Top,
  Medal as Award2,
  Target as Focus,
  Zap as Energy,
  Sparkles as Shine,
  Settings as Options,
  RefreshCw as Restart,
  CheckCircle as Complete,
  XCircle as Cancel,
  AlertTriangle as Caution,
  Info as Information,
  Trophy as Winner,
  Award as Achievement2,
  Star as Rate,
  Crown as Best,
  Medal as Honor2,
  Target as Objective,
  Zap as Boost,
  Sparkles as Glitter,
  Clock,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
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
  Flame,
  Fire,
  Bolt,
  Lightning as Flash,
  Zap as Thunder,
  Sparkles as Twinkle,
  Star as Bright,
  Award as Gold,
  Trophy as Silver,
  Medal as Bronze,
  Crown as Diamond,
  Target as Bullseye,
  Crosshair as Sight,
  Layers as Levels,
  Grid3x3 as Matrix,
  List as Ranks,
  Search as Hunt,
  Filter as Sort,
  Plus as Gain,
  Edit as Modify2,
  Trash2 as Lose,
  Share2 as Share,
  Download as Collect,
  Upload as Submit,
  Mail as Message,
  Phone as Call,
  Smartphone as Mobile,
  Tablet as Pad,
  Monitor as Screen,
  Wifi as Network,
  Bluetooth as Connect,
  Shield as Protect,
  Lock as Secure,
  Unlock as Open,
  Eye as View,
  EyeOff as Hide,
  Volume2 as Sound,
  VolumeX as Mute,
  Mic as Voice,
  MicOff as Silent,
  Camera as Photo,
  CameraOff as NoPhoto,
  Heart as Love,
  HeartOff as Unlove,
  Bookmark as Save,
  Tag as Label,
  Hash as Tag2,
  AtSign as Mention2
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedGamificationProps {
  className?: string
}

export function AdvancedGamification({ className }: AdvancedGamificationProps) {
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'leaderboards' | 'progress' | 'settings'>('achievements')
  const [isClaiming, setIsClaiming] = useState(false)
  const [gamificationEnabled, setGamificationEnabled] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null)
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Gamification queries
  const achievementsQuery = trpc.gamification.getAchievements.useQuery()
  const leaderboardsQuery = trpc.gamification.getLeaderboards.useQuery()
  const progressQuery = trpc.gamification.getProgress.useQuery()
  const settingsQuery = trpc.gamification.getGamificationSettings.useQuery()

  const claimAchievementMutation = trpc.gamification.claimAchievement.useMutation()
  const unlockAchievementMutation = trpc.gamification.unlockAchievement.useMutation()
  const updateProgressMutation = trpc.gamification.updateProgress.useMutation()
  const updateSettingsMutation = trpc.gamification.updateSettings.useMutation()

  const handleClaimAchievement = async (achievementId: string) => {
    try {
      setIsClaiming(true)
      haptic.selection()

      const result = await claimAchievementMutation.mutateAsync({
        achievementId
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to claim achievement:', error)
      haptic.error()
    } finally {
      setIsClaiming(false)
    }
  }

  const handleUnlockAchievement = async (achievementId: string) => {
    try {
      haptic.selection()

      const result = await unlockAchievementMutation.mutateAsync({
        achievementId
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to unlock achievement:', error)
      haptic.error()
    }
  }

  const handleUpdateProgress = async (progressId: string, value: number) => {
    try {
      haptic.selection()

      const result = await updateProgressMutation.mutateAsync({
        progressId,
        value
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
      haptic.error()
    }
  }

  const handleToggleGamification = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ gamificationEnabled: enabled })
      setGamificationEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle gamification:', error)
    }
  }

  const getAchievementStatus = (status: string) => {
    switch (status) {
      case 'unlocked': return { color: 'text-green-600', label: 'Unlocked', icon: Trophy }
      case 'locked': return { color: 'text-red-600', label: 'Locked', icon: Lock }
      case 'claimed': return { color: 'text-blue-600', label: 'Claimed', icon: CheckCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: AlertTriangle }
    }
  }

  const getLeaderboardPosition = (position: number) => {
    if (position === 1) return { color: 'text-yellow-600', icon: Crown }
    if (position === 2) return { color: 'text-gray-600', icon: Medal }
    if (position === 3) return { color: 'text-orange-600', icon: Award }
    return { color: 'text-blue-600', icon: Star }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Gamification</h2>
          <p className="text-muted-foreground">
            Achievement system, leaderboards og progress tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Achievements Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Leaderboards Active
          </Badge>
        </div>
      </div>

      {/* Gamification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {progressQuery.data?.totalPoints || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {achievementsQuery.data?.unlockedAchievements || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Achievements unlocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {progressQuery.data?.currentLevel || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Current level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
            <Medal className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              #{leaderboardsQuery.data?.userRank || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Global rank
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'achievements' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('achievements')}
          className="flex-1"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Achievements
        </Button>
        <Button
          variant={selectedTab === 'leaderboards' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('leaderboards')}
          className="flex-1"
        >
          <Crown className="w-4 h-4 mr-2" />
          Leaderboards
        </Button>
        <Button
          variant={selectedTab === 'progress' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('progress')}
          className="flex-1"
        >
          <Target className="w-4 h-4 mr-2" />
          Progress
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

      {/* Achievements Tab */}
      {selectedTab === 'achievements' && (
        <div className="space-y-4">
          {/* Achievement System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievement System
              </CardTitle>
              <CardDescription>
                Unlock achievements og earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievementsQuery.data?.achievements?.map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.status === 'unlocked' ? 'bg-green-100' :
                        achievement.status === 'claimed' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Trophy className={`w-6 h-6 ${
                          achievement.status === 'unlocked' ? 'text-green-600' :
                          achievement.status === 'claimed' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {achievement.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{achievement.points} points</div>
                        <div className="text-xs text-muted-foreground">
                          {achievement.status}
                        </div>
                      </div>

                      {achievement.status === 'unlocked' && !achievement.claimed && (
                        <Button
                          onClick={() => handleClaimAchievement(achievement.id)}
                          disabled={isClaiming}
                          size="sm"
                        >
                          Claim
                        </Button>
                      )}

                      <Badge variant={achievement.status === 'unlocked' ? 'default' : 'secondary'}>
                        {achievement.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievement Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Achievement Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievementsQuery.data?.achievementCategories?.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <category.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.completed}/{category.total} completed
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboards Tab */}
      {selectedTab === 'leaderboards' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Global Leaderboards
              </CardTitle>
              <CardDescription>
                Compete with other users og climb the ranks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardsQuery.data?.leaderboards?.map((leaderboard) => (
                  <div key={leaderboard.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{leaderboard.name}</h3>
                      <Badge variant="outline">{leaderboard.type}</Badge>
                    </div>
                    <div className="space-y-2">
                      {leaderboard.rankings?.map((ranking, index) => (
                        <div key={ranking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-100' :
                              index === 1 ? 'bg-gray-100' :
                              index === 2 ? 'bg-orange-100' : 'bg-blue-100'
                            }`}>
                              <span className={`text-sm font-bold ${
                                index === 0 ? 'text-yellow-600' :
                                index === 1 ? 'text-gray-600' :
                                index === 2 ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{ranking.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {ranking.description}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium">{ranking.score}</div>
                            <div className="text-xs text-muted-foreground">
                              {ranking.points} points
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Leaderboard Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {leaderboardsQuery.data?.leaderboardAnalytics?.map((analytic) => (
                  <div key={analytic.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <analytic.icon className="w-6 h-6 text-purple-600" />
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

      {/* Progress Tab */}
      {selectedTab === 'progress' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Progress Tracking
              </CardTitle>
              <CardDescription>
                Track your progress og level up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressQuery.data?.progressItems?.map((progress) => (
                  <div key={progress.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{progress.name}</span>
                      <span className="text-sm font-medium">{progress.current}/{progress.target}</span>
                    </div>
                    <Progress value={(progress.current / progress.target) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {progress.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressQuery.data?.levelProgress?.map((level) => (
                  <div key={level.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Crown className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">Level {level.level}</div>
                        <div className="text-sm text-muted-foreground">
                          {level.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{level.progress}%</div>
                        <div className="text-xs text-muted-foreground">
                          {level.currentXP}/{level.requiredXP} XP
                        </div>
                      </div>

                      <Badge variant={level.completed ? 'default' : 'secondary'}>
                        {level.completed ? 'Completed' : 'In Progress'}
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
                Gamification Settings
              </CardTitle>
              <CardDescription>
                Configure gamification preferences
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
                        if (setting.key === 'gamificationEnabled') {
                          handleToggleGamification(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gamification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Gamification Preferences
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
              <Trophy className="w-5 h-5" />
              <span className="text-sm">Achievements</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Crown className="w-5 h-5" />
              <span className="text-sm">Leaderboards</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">Progress</span>
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
