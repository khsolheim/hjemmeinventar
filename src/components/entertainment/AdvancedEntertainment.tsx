'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Play,
  Music,
  Video,
  Gamepad2,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Trash2,
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
  Clock,
  Target,
  MessageSquare,
  Phone,
  FileText
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedEntertainmentProps {
  className?: string
}

export function AdvancedEntertainment({ className }: AdvancedEntertainmentProps) {
  const [selectedTab, setSelectedTab] = useState<'media' | 'streaming' | 'gaming' | 'settings'>('media')
  const [isPlayingMedia, setIsPlayingMedia] = useState(false)
  const [entertainmentEnabled, setEntertainmentEnabled] = useState(true)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Entertainment queries
  const mediaQuery = trpc.entertainment.getMediaData.useQuery()
  const streamingQuery = trpc.entertainment.getStreamingData.useQuery()
  const gamingQuery = trpc.entertainment.getGamingData.useQuery()
  const settingsQuery = trpc.entertainment.getEntertainmentSettings.useQuery()

  const playMediaMutation = trpc.entertainment.playMedia.useMutation()
  const startStreamingMutation = trpc.entertainment.startStreaming.useMutation()
  const startGameMutation = trpc.entertainment.startGame.useMutation()
  const updateSettingsMutation = trpc.entertainment.updateSettings.useMutation()

  const handlePlayMedia = async (mediaData: any) => {
    try {
      setIsPlayingMedia(true)
      haptic.selection()

      const result = await playMediaMutation.mutateAsync(mediaData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to play media:', error)
      haptic.error()
    } finally {
      setIsPlayingMedia(false)
    }
  }

  const handleStartStreaming = async (streamingData: any) => {
    try {
      haptic.selection()

      const result = await startStreamingMutation.mutateAsync(streamingData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start streaming:', error)
      haptic.error()
    }
  }

  const handleStartGame = async (gameData: any) => {
    try {
      haptic.selection()

      const result = await startGameMutation.mutateAsync(gameData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start game:', error)
      haptic.error()
    }
  }

  const handleToggleEntertainment = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ entertainmentEnabled: enabled })
      setEntertainmentEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle entertainment:', error)
    }
  }

  const getMediaStatus = (status: string) => {
    switch (status) {
      case 'playing': return { color: 'text-green-600', label: 'Playing', icon: Play }
      case 'paused': return { color: 'text-yellow-600', label: 'Paused', icon: Pause }
      case 'stopped': return { color: 'text-red-600', label: 'Stopped', icon: Stop }
      case 'queued': return { color: 'text-blue-600', label: 'Queued', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getGameStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Active', icon: Gamepad2 }
      case 'paused': return { color: 'text-yellow-600', label: 'Paused', icon: Pause }
      case 'completed': return { color: 'text-blue-600', label: 'Completed', icon: Trophy }
      case 'abandoned': return { color: 'text-red-600', label: 'Abandoned', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Entertainment</h2>
          <p className="text-muted-foreground">
            Media management, streaming og gaming
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            Entertainment Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            Media Active
          </Badge>
        </div>
      </div>

      {/* Entertainment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <Music className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mediaQuery.data?.totalMedia || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Songs, videos, podcasts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streaming Time</CardTitle>
            <Video className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {streamingQuery.data?.totalStreamingTime || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <Gamepad2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {gamingQuery.data?.totalGamesPlayed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entertainment Score</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.entertainmentScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'media' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('media')}
          className="flex-1"
        >
          <Music className="w-4 h-4 mr-2" />
          Media
        </Button>
        <Button
          variant={selectedTab === 'streaming' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('streaming')}
          className="flex-1"
        >
          <Video className="w-4 h-4 mr-2" />
          Streaming
        </Button>
        <Button
          variant={selectedTab === 'gaming' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('gaming')}
          className="flex-1"
        >
          <Gamepad2 className="w-4 h-4 mr-2" />
          Gaming
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

      {/* Media Tab */}
      {selectedTab === 'media' && (
        <div className="space-y-4">
          {/* Media Library */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Media Library
              </CardTitle>
              <CardDescription>
                Manage your music, videos og podcasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mediaQuery.data?.mediaLibrary?.map((media) => (
                  <div key={media.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <media.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{media.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {media.artist} • {media.duration}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{media.genre}</div>
                        <div className="text-xs text-muted-foreground">
                          {media.year}
                        </div>
                      </div>

                      <Button
                        onClick={() => handlePlayMedia({ mediaId: media.id, action: 'play' })}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={media.status === 'playing' ? 'default' : 'secondary'}>
                        {media.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Media Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Media Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaQuery.data?.mediaAnalytics?.map((analytic) => (
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

      {/* Streaming Tab */}
      {selectedTab === 'streaming' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Streaming Services
              </CardTitle>
              <CardDescription>
                Manage your streaming subscriptions og content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {streamingQuery.data?.streamingServices?.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.content} • {service.watchTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{service.subscription}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.nextBilling}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartStreaming({ serviceId: service.id, content: 'latest' })}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Streaming Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Streaming Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {streamingQuery.data?.streamingAnalytics?.map((analytic) => (
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

      {/* Gaming Tab */}
      {selectedTab === 'gaming' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Gaming Library
              </CardTitle>
              <CardDescription>
                Manage your games og gaming progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gamingQuery.data?.gamingLibrary?.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <game.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{game.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {game.platform} • {game.playTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{game.progress}%</div>
                        <div className="text-xs text-muted-foreground">
                          {game.achievements} achievements
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartGame({ gameId: game.id, action: 'play' })}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>
                        {game.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gaming Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Gaming Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gamingQuery.data?.gamingAnalytics?.map((analytic) => (
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
                Entertainment Settings
              </CardTitle>
              <CardDescription>
                Configure your entertainment preferences
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
                        if (setting.key === 'entertainmentEnabled') {
                          handleToggleEntertainment(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Entertainment Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Entertainment Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.entertainmentGoals?.map((goal) => (
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
              <Play className="w-5 h-5" />
              <span className="text-sm">Play Media</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Video className="w-5 h-5" />
              <span className="text-sm">Start Streaming</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Gamepad2 className="w-5 h-5" />
              <span className="text-sm">Start Game</span>
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
