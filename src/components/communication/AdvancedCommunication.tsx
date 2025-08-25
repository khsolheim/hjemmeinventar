'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  MessageSquare,
  Video,
  Phone,
  FileText,
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
  Target
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedCommunicationProps {
  className?: string
}

export function AdvancedCommunication({ className }: AdvancedCommunicationProps) {
  const [selectedTab, setSelectedTab] = useState<'messages' | 'calls' | 'files' | 'settings'>('messages')
  const [isStartingCall, setIsStartingCall] = useState(false)
  const [communicationEnabled, setCommunicationEnabled] = useState(true)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Communication queries
  const messagesQuery = trpc.communication.getMessagesData.useQuery()
  const callsQuery = trpc.communication.getCallsData.useQuery()
  const filesQuery = trpc.communication.getFilesData.useQuery()
  const settingsQuery = trpc.communication.getCommunicationSettings.useQuery()

  const sendMessageMutation = trpc.communication.sendMessage.useMutation()
  const startCallMutation = trpc.communication.startCall.useMutation()
  const shareFileMutation = trpc.communication.shareFile.useMutation()
  const updateSettingsMutation = trpc.communication.updateSettings.useMutation()

  const handleSendMessage = async (messageData: any) => {
    try {
      haptic.selection()

      const result = await sendMessageMutation.mutateAsync(messageData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      haptic.error()
    }
  }

  const handleStartCall = async (contactId: string, callType: 'video' | 'voice') => {
    try {
      setIsStartingCall(true)
      haptic.selection()

      const result = await startCallMutation.mutateAsync({
        contactId,
        callType
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start call:', error)
      haptic.error()
    } finally {
      setIsStartingCall(false)
    }
  }

  const handleShareFile = async (fileData: any) => {
    try {
      haptic.selection()

      const result = await shareFileMutation.mutateAsync(fileData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to share file:', error)
      haptic.error()
    }
  }

  const handleToggleCommunication = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ communicationEnabled: enabled })
      setCommunicationEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle communication:', error)
    }
  }

  const getMessageStatus = (status: string) => {
    switch (status) {
      case 'sent': return { color: 'text-blue-600', label: 'Sent', icon: CheckCircle }
      case 'delivered': return { color: 'text-green-600', label: 'Delivered', icon: CheckCircle }
      case 'read': return { color: 'text-purple-600', label: 'Read', icon: CheckCircle }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getCallStatus = (status: string) => {
    switch (status) {
      case 'connected': return { color: 'text-green-600', label: 'Connected', icon: Phone }
      case 'ringing': return { color: 'text-yellow-600', label: 'Ringing', icon: Phone }
      case 'missed': return { color: 'text-red-600', label: 'Missed', icon: Phone }
      case 'ended': return { color: 'text-gray-600', label: 'Ended', icon: Phone }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Communication</h2>
          <p className="text-muted-foreground">
            Messaging system, video calls og file sharing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Communication Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            Video Calls Active
          </Badge>
        </div>
      </div>

      {/* Communication Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {messagesQuery.data?.totalMessages || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {callsQuery.data?.totalCalls || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filesQuery.data?.totalFiles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total shared
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Contacts</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.onlineContacts || 0}
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
          variant={selectedTab === 'messages' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('messages')}
          className="flex-1"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Messages
        </Button>
        <Button
          variant={selectedTab === 'calls' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('calls')}
          className="flex-1"
        >
          <Phone className="w-4 h-4 mr-2" />
          Calls
        </Button>
        <Button
          variant={selectedTab === 'files' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('files')}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Files
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

      {/* Messages Tab */}
      {selectedTab === 'messages' && (
        <div className="space-y-4">
          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Messages
              </CardTitle>
              <CardDescription>
                View and manage your conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messagesQuery.data?.recentMessages?.map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <message.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{message.sender}</div>
                        <div className="text-sm text-muted-foreground">
                          {message.content}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{message.time}</div>
                        <div className="text-xs text-muted-foreground">
                          {message.date}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSendMessage({ recipientId: message.senderId, content: 'Reply' })}
                        variant="outline"
                        size="sm"
                      >
                        Reply
                      </Button>

                      <Badge variant={message.status === 'read' ? 'default' : 'secondary'}>
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Message Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {messagesQuery.data?.messageAnalytics?.map((analytic) => (
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

      {/* Calls Tab */}
      {selectedTab === 'calls' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Recent Calls
              </CardTitle>
              <CardDescription>
                View your call history and start new calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {callsQuery.data?.recentCalls?.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <call.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{call.contact}</div>
                        <div className="text-sm text-muted-foreground">
                          {call.type} call • {call.duration}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{call.time}</div>
                        <div className="text-xs text-muted-foreground">
                          {call.date}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartCall(call.contactId, call.type as 'video' | 'voice')}
                        variant="outline"
                        size="sm"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>

                      <Badge variant={call.status === 'connected' ? 'default' : 'secondary'}>
                        {call.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Call Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {callsQuery.data?.callAnalytics?.map((analytic) => (
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

      {/* Files Tab */}
      {selectedTab === 'files' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Shared Files
              </CardTitle>
              <CardDescription>
                Manage and share files with contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filesQuery.data?.sharedFiles?.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <file.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.size} • Shared by {file.sharedBy}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{file.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {file.date}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleShareFile({ fileId: file.id, recipientId: 'contact' })}
                        variant="outline"
                        size="sm"
                      >
                        Share
                      </Button>

                      <Badge variant={file.status === 'shared' ? 'default' : 'secondary'}>
                        {file.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* File Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                File Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filesQuery.data?.fileAnalytics?.map((analytic) => (
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
                Communication Settings
              </CardTitle>
              <CardDescription>
                Configure your communication preferences
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
                        if (setting.key === 'communicationEnabled') {
                          handleToggleCommunication(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Communication Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Communication Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.communicationGoals?.map((goal) => (
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
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">New Message</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Video className="w-5 h-5" />
              <span className="text-sm">Video Call</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Share File</span>
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
