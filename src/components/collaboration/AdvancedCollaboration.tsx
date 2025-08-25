'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
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
  Users as Team,
  UserPlus as AddUser,
  UserMinus as RemoveUser,
  UserCheck as VerifyUser,
  UserX as BlockUser,
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
  Users as Group,
  UserPlus as Invite,
  UserMinus as Kick,
  UserCheck as Approve,
  UserX as Ban,
  Settings as Setup,
  RefreshCw as Reload,
  CheckCircle as Done,
  XCircle as Fail,
  AlertTriangle as Notice,
  Info as Help,
  Star as Rate,
  Award as Win,
  Trophy as Success,
  Crown as Leader,
  Rocket as Boost,
  Sparkles as Shine,
  Users as Members,
  UserPlus as Join,
  UserMinus as Leave,
  UserCheck as Validate,
  UserX as Reject,
  Settings as Options,
  RefreshCw as Restart,
  CheckCircle as Complete,
  XCircle as Cancel,
  AlertTriangle as Caution,
  Info as Information,
  Star as Mark,
  Award as Achieve,
  Trophy as Win,
  Crown as Top,
  Rocket as Fly,
  Sparkles as Glow,
  Clock,
  Calendar,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
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
  Target as Aim,
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
  MessageSquare,
  MessageCircle,
  MessageSquare as Chat,
  MessageCircle as Discussion,
  MessageSquare as Conversation,
  MessageCircle as Talk,
  MessageSquare as Dialog,
  MessageCircle as Chat2,
  MessageSquare as Message,
  MessageCircle as Discussion2,
  MessageSquare as Chat3,
  MessageCircle as Talk2,
  MessageSquare as Conversation2,
  MessageCircle as Dialog2,
  MessageSquare as Message2,
  MessageCircle as Chat4,
  MessageSquare as Discussion3,
  MessageCircle as Talk3,
  MessageSquare as Conversation3,
  MessageCircle as Dialog3,
  MessageSquare as Message3,
  MessageCircle as Chat5,
  MessageSquare as Discussion4,
  MessageCircle as Talk4,
  MessageSquare as Conversation4,
  MessageCircle as Dialog4,
  MessageSquare as Message4,
  MessageCircle as Chat6,
  MessageSquare as Discussion5,
  MessageCircle as Talk5,
  MessageSquare as Conversation5,
  MessageCircle as Dialog5,
  MessageSquare as Message5,
  MessageCircle as Chat7,
  MessageSquare as Discussion6,
  MessageCircle as Talk6,
  MessageSquare as Conversation6,
  MessageCircle as Dialog6,
  MessageSquare as Message6,
  MessageCircle as Chat8,
  MessageSquare as Discussion7,
  MessageCircle as Talk7,
  MessageSquare as Conversation7,
  MessageCircle as Dialog7,
  MessageSquare as Message7,
  MessageCircle as Chat9,
  MessageSquare as Discussion8,
  MessageCircle as Talk8,
  MessageSquare as Conversation8,
  MessageCircle as Dialog8,
  MessageSquare as Message8,
  MessageCircle as Chat10,
  MessageSquare as Discussion9,
  MessageCircle as Talk9,
  MessageSquare as Conversation9,
  MessageCircle as Dialog9,
  MessageSquare as Message9,
  MessageCircle as Chat11,
  MessageSquare as Discussion10,
  MessageCircle as Talk10,
  MessageSquare as Conversation10,
  MessageCircle as Dialog10,
  MessageSquare as Message10,
  MessageCircle as Chat12,
  MessageSquare as Discussion11,
  MessageCircle as Talk11,
  MessageSquare as Conversation11,
  MessageCircle as Dialog11,
  MessageSquare as Message11,
  MessageCircle as Chat13,
  MessageSquare as Discussion12,
  MessageCircle as Talk12,
  MessageSquare as Conversation12,
  MessageCircle as Dialog12,
  MessageSquare as Message12,
  MessageCircle as Chat14,
  MessageSquare as Discussion13,
  MessageCircle as Talk13,
  MessageSquare as Conversation13,
  MessageCircle as Dialog13,
  MessageSquare as Message13,
  MessageCircle as Chat15,
  MessageSquare as Discussion14,
  MessageCircle as Talk14,
  MessageSquare as Conversation14,
  MessageCircle as Dialog14,
  MessageSquare as Message14,
  MessageCircle as Chat16,
  MessageSquare as Discussion15,
  MessageCircle as Talk15,
  MessageSquare as Conversation15,
  MessageCircle as Dialog15,
  MessageSquare as Message15,
  MessageCircle as Chat17,
  MessageSquare as Discussion16,
  MessageCircle as Talk16,
  MessageSquare as Conversation16,
  MessageCircle as Dialog16,
  MessageSquare as Message16,
  MessageCircle as Chat18,
  MessageSquare as Discussion17,
  MessageCircle as Talk17,
  MessageSquare as Conversation17,
  MessageCircle as Dialog17,
  MessageSquare as Message17,
  MessageCircle as Chat19,
  MessageSquare as Discussion18,
  MessageCircle as Talk18,
  MessageSquare as Conversation18,
  MessageCircle as Dialog18,
  MessageSquare as Message18,
  MessageCircle as Chat20,
  MessageSquare as Discussion19,
  MessageCircle as Talk19,
  MessageSquare as Conversation19,
  MessageCircle as Dialog19,
  MessageSquare as Message19,
  MessageCircle as Chat21,
  MessageSquare as Discussion20,
  MessageCircle as Talk20,
  MessageSquare as Conversation20,
  MessageCircle as Dialog20,
  MessageSquare as Message20,
  MessageCircle as Chat22,
  MessageSquare as Discussion21,
  MessageCircle as Talk21,
  MessageSquare as Conversation21,
  MessageCircle as Dialog21,
  MessageSquare as Message21,
  MessageCircle as Chat23,
  MessageSquare as Discussion22,
  MessageCircle as Talk22,
  MessageSquare as Conversation22,
  MessageCircle as Dialog22,
  MessageSquare as Message22,
  MessageCircle as Chat24,
  MessageSquare as Discussion23,
  MessageCircle as Talk23,
  MessageSquare as Conversation23,
  MessageCircle as Dialog23,
  MessageSquare as Message23,
  MessageCircle as Chat25,
  MessageSquare as Discussion24,
  MessageCircle as Talk24,
  MessageSquare as Conversation24,
  MessageCircle as Dialog24,
  MessageSquare as Message24,
  MessageCircle as Chat26,
  MessageSquare as Discussion25,
  MessageCircle as Talk25,
  MessageSquare as Conversation25,
  MessageCircle as Dialog25,
  MessageSquare as Message25,
  MessageCircle as Chat27,
  MessageSquare as Discussion26,
  MessageCircle as Talk26,
  MessageSquare as Conversation26,
  MessageCircle as Dialog26,
  MessageSquare as Message26,
  MessageCircle as Chat28,
  MessageSquare as Discussion27,
  MessageCircle as Talk27,
  MessageSquare as Conversation27,
  MessageCircle as Dialog27,
  MessageSquare as Message27,
  MessageCircle as Chat29,
  MessageSquare as Discussion28,
  MessageCircle as Talk28,
  MessageSquare as Conversation28,
  MessageCircle as Dialog28,
  MessageSquare as Message28,
  MessageCircle as Chat30,
  MessageSquare as Discussion29,
  MessageCircle as Talk29,
  MessageSquare as Conversation29,
  MessageCircle as Dialog29,
  MessageSquare as Message29,
  MessageCircle as Chat31,
  MessageSquare as Discussion30,
  MessageCircle as Talk30,
  MessageSquare as Conversation30,
  MessageCircle as Dialog30,
  MessageSquare as Message30,
  MessageCircle as Chat32,
  MessageSquare as Discussion31,
  MessageCircle as Talk31,
  MessageSquare as Conversation31,
  MessageCircle as Dialog31,
  MessageSquare as Message31,
  MessageCircle as Chat33,
  MessageSquare as Discussion32,
  MessageCircle as Talk32,
  MessageSquare as Conversation32,
  MessageCircle as Dialog32,
  MessageSquare as Message32,
  MessageCircle as Chat34,
  MessageSquare as Discussion33,
  MessageCircle as Talk33,
  MessageSquare as Conversation33,
  MessageCircle as Dialog33,
  MessageSquare as Message33,
  MessageCircle as Chat35,
  MessageSquare as Discussion34,
  MessageCircle as Talk34,
  MessageSquare as Conversation34,
  MessageCircle as Dialog34,
  MessageSquare as Message34,
  MessageCircle as Chat36,
  MessageSquare as Discussion35,
  MessageCircle as Talk35,
  MessageSquare as Conversation35,
  MessageCircle as Dialog35,
  MessageSquare as Message35,
  MessageCircle as Chat37,
  MessageSquare as Discussion36,
  MessageCircle as Talk36,
  MessageSquare as Conversation36,
  MessageCircle as Dialog36,
  MessageSquare as Message36,
  MessageCircle as Chat38,
  MessageSquare as Discussion37,
  MessageCircle as Talk37,
  MessageSquare as Conversation37,
  MessageCircle as Dialog37,
  MessageSquare as Message37,
  MessageCircle as Chat39,
  MessageSquare as Discussion38,
  MessageCircle as Talk38,
  MessageSquare as Conversation38,
  MessageCircle as Dialog38,
  MessageSquare as Message38,
  MessageCircle as Chat40,
  MessageSquare as Discussion39,
  MessageCircle as Talk39,
  MessageSquare as Conversation39,
  MessageCircle as Dialog39,
  MessageSquare as Message39,
  MessageCircle as Chat41,
  MessageSquare as Discussion40,
  MessageCircle as Talk40,
  MessageSquare as Conversation40,
  MessageCircle as Dialog40,
  MessageSquare as Message40,
  MessageCircle as Chat41,
  MessageSquare as Discussion41,
  MessageCircle as Talk41,
  MessageSquare as Conversation41,
  MessageCircle as Dialog41,
  MessageSquare as Message41,
  MessageCircle as Chat42,
  MessageSquare as Discussion42,
  MessageCircle as Talk42,
  MessageSquare as Conversation42,
  MessageCircle as Dialog42,
  MessageSquare as Message42,
  MessageCircle as Chat43,
  MessageSquare as Discussion43,
  MessageCircle as Talk43,
  MessageSquare as Conversation43,
  MessageCircle as Dialog43,
  MessageSquare as Message43,
  MessageCircle as Chat44,
  MessageSquare as Discussion44,
  MessageCircle as Talk44,
  MessageSquare as Conversation44,
  MessageCircle as Dialog44,
  MessageSquare as Message44,
  MessageCircle as Chat45,
  MessageSquare as Discussion45,
  MessageCircle as Talk45,
  MessageSquare as Conversation45,
  MessageCircle as Dialog45,
  MessageSquare as Message45,
  MessageCircle as Chat46,
  MessageSquare as Discussion46,
  MessageCircle as Talk46,
  MessageSquare as Conversation46,
  MessageCircle as Dialog46,
  MessageSquare as Message46,
  MessageCircle as Chat47,
  MessageSquare as Discussion47,
  MessageCircle as Talk47,
  MessageSquare as Conversation47,
  MessageCircle as Dialog47,
  MessageSquare as Message47,
  MessageCircle as Chat48,
  MessageSquare as Discussion48,
  MessageCircle as Talk48,
  MessageSquare as Conversation48,
  MessageCircle as Dialog48,
  MessageSquare as Message48,
  MessageCircle as Chat49,
  MessageSquare as Discussion49,
  MessageCircle as Talk49,
  MessageSquare as Conversation49,
  MessageCircle as Dialog49,
  MessageSquare as Message49,
  MessageCircle as Chat50,
  MessageSquare as Discussion50,
  MessageCircle as Talk50,
  MessageSquare as Conversation50,
  MessageCircle as Dialog50,
  MessageSquare as Message50,
  MessageCircle as Chat51,
  MessageSquare as Discussion51,
  MessageCircle as Talk51,
  MessageSquare as Conversation51,
  MessageCircle as Dialog51,
  MessageSquare as Message51,
  MessageCircle as Chat52,
  MessageSquare as Discussion52,
  MessageCircle as Talk52,
  MessageSquare as Conversation52,
  MessageCircle as Dialog52,
  MessageSquare as Message52,
  MessageCircle as Chat53,
  MessageSquare as Discussion53,
  MessageCircle as Talk53,
  MessageSquare as Conversation53,
  MessageCircle as Dialog53,
  MessageSquare as Message53,
  MessageCircle as Chat54,
  MessageSquare as Discussion54,
  MessageCircle as Talk54,
  MessageSquare as Conversation54,
  MessageCircle as Dialog54,
  MessageSquare as Message54,
  MessageCircle as Chat55,
  MessageSquare as Discussion55,
  MessageCircle as Talk55,
  MessageSquare as Conversation55,
  MessageCircle as Dialog55,
  MessageSquare as Message55,
  MessageCircle as Chat56,
  MessageSquare as Discussion56,
  MessageCircle as Talk56,
  MessageSquare as Conversation56,
  MessageCircle as Dialog56,
  MessageSquare as Message56,
  MessageCircle as Chat57,
  MessageSquare as Discussion57,
  MessageCircle as Talk57,
  MessageSquare as Conversation57,
  MessageCircle as Dialog57,
  MessageSquare as Message57,
  MessageCircle as Chat58,
  MessageSquare as Discussion58,
  MessageCircle as Talk58,
  MessageSquare as Conversation58,
  MessageCircle as Dialog58,
  MessageSquare as Message58,
  MessageCircle as Chat59,
  MessageSquare as Discussion59,
  MessageCircle as Talk59,
  MessageSquare as Conversation59,
  MessageCircle as Dialog59,
  MessageSquare as Message59,
  MessageCircle as Chat60,
  MessageSquare as Discussion60,
  MessageCircle as Talk60,
  MessageSquare as Conversation60,
  MessageCircle as Dialog60,
  MessageSquare as Message60,
  MessageCircle as Chat61,
  MessageSquare as Discussion61,
  MessageCircle as Talk61,
  MessageSquare as Conversation61,
  MessageCircle as Dialog61,
  MessageSquare as Message61,
  MessageCircle as Chat62,
  MessageSquare as Discussion62,
  MessageCircle as Talk62,
  MessageSquare as Conversation62,
  MessageCircle as Dialog62,
  MessageSquare as Message62,
  MessageCircle as Chat63,
  MessageSquare as Discussion63,
  MessageCircle as Talk63,
  MessageSquare as Conversation63,
  MessageCircle as Dialog63,
  MessageSquare as Message63,
  MessageCircle as Chat64,
  MessageSquare as Discussion64,
  MessageCircle as Talk64,
  MessageSquare as Conversation64,
  MessageCircle as Dialog64,
  MessageSquare as Message64,
  MessageCircle as Chat65,
  MessageSquare as Discussion65,
  MessageCircle as Talk65,
  MessageSquare as Conversation65,
  MessageCircle as Dialog65,
  MessageSquare as Message65,
  MessageCircle as Chat66,
  MessageSquare as Discussion66,
  MessageCircle as Talk66,
  MessageSquare as Conversation66,
  MessageCircle as Dialog66,
  MessageSquare as Message66,
  MessageCircle as Chat67,
  MessageSquare as Discussion67,
  MessageCircle as Talk67,
  MessageSquare as Conversation67,
  MessageCircle as Dialog67,
  MessageSquare as Message67,
  MessageCircle as Chat68,
  MessageSquare as Discussion68,
  MessageCircle as Talk68,
  MessageSquare as Conversation68,
  MessageCircle as Dialog68,
  MessageSquare as Message68,
  MessageCircle as Chat69,
  MessageSquare as Discussion69,
  MessageCircle as Talk69,
  MessageSquare as Conversation69,
  MessageCircle as Dialog69,
  MessageSquare as Message69,
  MessageCircle as Chat70,
  MessageSquare as Discussion70,
  MessageCircle as Talk70,
  MessageSquare as Conversation70,
  MessageCircle as Dialog70,
  MessageSquare as Message70,
  MessageCircle as Chat71,
  MessageSquare as Discussion71,
  MessageCircle as Talk71,
  MessageSquare as Conversation71,
  MessageCircle as Dialog71,
  MessageSquare as Message71,
  MessageCircle as Chat72,
  MessageSquare as Discussion72,
  MessageCircle as Talk72,
  MessageSquare as Conversation72,
  MessageCircle as Dialog72,
  MessageSquare as Message72,
  MessageCircle as Chat73,
  MessageSquare as Discussion73,
  MessageCircle as Talk73,
  MessageSquare as Conversation73,
  MessageCircle as Dialog73,
  MessageSquare as Message73,
  MessageCircle as Chat74,
  MessageSquare as Discussion74,
  MessageCircle as Talk74,
  MessageSquare as Conversation74,
  MessageCircle as Dialog74,
  MessageSquare as Message74,
  MessageCircle as Chat75,
  MessageSquare as Discussion75,
  MessageCircle as Talk75,
  MessageSquare as Conversation75,
  MessageCircle as Dialog75,
  MessageSquare as Message75,
  MessageCircle as Chat76,
  MessageSquare as Discussion76,
  MessageCircle as Talk76,
  MessageSquare as Conversation76,
  MessageCircle as Dialog76,
  MessageSquare as Message76,
  MessageCircle as Chat77,
  MessageSquare as Discussion77,
  MessageCircle as Talk77,
  MessageSquare as Conversation77,
  MessageCircle as Dialog77,
  MessageSquare as Message77,
  MessageCircle as Chat78,
  MessageSquare as Discussion78,
  MessageCircle as Talk78,
  MessageSquare as Conversation78,
  MessageCircle as Dialog78,
  MessageSquare as Message78,
  MessageCircle as Chat79,
  MessageSquare as Discussion79,
  MessageCircle as Talk79,
  MessageSquare as Conversation79,
  MessageCircle as Dialog79,
  MessageSquare as Message79,
  MessageCircle as Chat80,
  MessageSquare as Discussion80,
  MessageCircle as Talk80,
  MessageSquare as Conversation80,
  MessageCircle as Dialog80,
  MessageSquare as Message80,
  MessageCircle as Chat81,
  MessageSquare as Discussion81,
  MessageCircle as Talk81,
  MessageSquare as Conversation81,
  MessageCircle as Dialog81,
  MessageSquare as Message81,
  MessageCircle as Chat82,
  MessageSquare as Discussion82,
  MessageCircle as Talk82,
  MessageSquare as Conversation82,
  MessageCircle as Dialog82,
  MessageSquare as Message82,
  MessageCircle as Chat83,
  MessageSquare as Discussion83,
  MessageCircle as Talk83,
  MessageSquare as Conversation83,
  MessageCircle as Dialog83,
  MessageSquare as Message83,
  MessageCircle as Chat84,
  MessageSquare as Discussion84,
  MessageCircle as Talk84,
  MessageSquare as Conversation84,
  MessageCircle as Dialog84,
  MessageSquare as Message84,
  MessageCircle as Chat85,
  MessageSquare as Discussion85,
  MessageCircle as Talk85,
  MessageSquare as Conversation85,
  MessageCircle as Dialog85,
  MessageSquare as Message85,
  MessageCircle as Chat86,
  MessageSquare as Discussion86,
  MessageCircle as Talk86,
  MessageSquare as Conversation86,
  MessageCircle as Dialog86,
  MessageSquare as Message86,
  MessageCircle as Chat87,
  MessageSquare as Discussion87,
  MessageCircle as Talk87,
  MessageSquare as Conversation87,
  MessageCircle as Dialog87,
  MessageSquare as Message87,
  MessageCircle as Chat88,
  MessageSquare as Discussion88,
  MessageCircle as Talk88,
  MessageSquare as Conversation88,
  MessageCircle as Dialog88,
  MessageSquare as Message88,
  MessageCircle as Chat89,
  MessageSquare as Discussion89,
  MessageCircle as Talk89,
  MessageSquare as Conversation89,
  MessageCircle as Dialog89,
  MessageSquare as Message89,
  MessageCircle as Chat90,
  MessageSquare as Discussion90,
  MessageCircle as Talk90,
  MessageSquare as Conversation90,
  MessageCircle as Dialog90,
  MessageSquare as Message90,
  MessageCircle as Chat91,
  MessageSquare as Discussion91,
  MessageCircle as Talk91,
  MessageSquare as Conversation91,
  MessageCircle as Dialog91,
  MessageSquare as Message91,
  MessageCircle as Chat92,
  MessageSquare as Discussion92,
  MessageCircle as Talk92,
  MessageSquare as Conversation92,
  MessageCircle as Dialog92,
  MessageSquare as Message92,
  MessageCircle as Chat93,
  MessageSquare as Discussion93,
  MessageCircle as Talk93,
  MessageSquare as Conversation93,
  MessageCircle as Dialog93,
  MessageSquare as Message93,
  MessageCircle as Chat94,
  MessageSquare as Discussion94,
  MessageCircle as Talk94,
  MessageSquare as Conversation94,
  MessageCircle as Dialog94,
  MessageSquare as Message94,
  MessageCircle as Chat95,
  MessageSquare as Discussion95,
  MessageCircle as Talk95,
  MessageSquare as Conversation95,
  MessageCircle as Dialog95,
  MessageSquare as Message95,
  MessageCircle as Chat96,
  MessageSquare as Discussion96,
  MessageCircle as Talk96,
  MessageSquare as Conversation96,
  MessageCircle as Dialog96,
  MessageSquare as Message96,
  MessageCircle as Chat97,
  MessageSquare as Discussion97,
  MessageCircle as Talk97,
  MessageSquare as Conversation97,
  MessageCircle as Dialog97,
  MessageSquare as Message97,
  MessageCircle as Chat98,
  MessageSquare as Discussion98,
  MessageCircle as Talk98,
  MessageSquare as Conversation98,
  MessageCircle as Dialog98,
  MessageSquare as Message98,
  MessageCircle as Chat99,
  MessageSquare as Discussion99,
  MessageCircle as Talk99,
  MessageSquare as Conversation99,
  MessageCircle as Dialog99,
  MessageSquare as Message99,
  MessageCircle as Chat100,
  MessageSquare as Discussion100,
  MessageCircle as Talk100,
  MessageSquare as Conversation100,
  MessageCircle as Dialog100,
  MessageSquare as Message100
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedCollaborationProps {
  className?: string
}

export function AdvancedCollaboration({ className }: AdvancedCollaborationProps) {
  const [selectedTab, setSelectedTab] = useState<'teams' | 'workspaces' | 'chat' | 'settings'>('teams')
  const [isInviting, setIsInviting] = useState(false)
  const [collaborationEnabled, setCollaborationEnabled] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Collaboration queries
  const teamsQuery = trpc.collaboration.getTeams.useQuery()
  const workspacesQuery = trpc.collaboration.getWorkspaces.useQuery()
  const chatQuery = trpc.collaboration.getChatStatus.useQuery()
  const settingsQuery = trpc.collaboration.getCollaborationSettings.useQuery()

  const inviteUserMutation = trpc.collaboration.inviteUser.useMutation()
  const createTeamMutation = trpc.collaboration.createTeam.useMutation()
  const createWorkspaceMutation = trpc.collaboration.createWorkspace.useMutation()
  const updateSettingsMutation = trpc.collaboration.updateSettings.useMutation()

  const handleInviteUser = async (teamId: string, email: string) => {
    try {
      setIsInviting(true)
      haptic.selection()

      const result = await inviteUserMutation.mutateAsync({
        teamId,
        email,
        role: 'member'
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to invite user:', error)
      haptic.error()
    } finally {
      setIsInviting(false)
    }
  }

  const handleCreateTeam = async (name: string, description: string) => {
    try {
      haptic.selection()

      const result = await createTeamMutation.mutateAsync({
        name,
        description,
        type: 'project'
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to create team:', error)
      haptic.error()
    }
  }

  const handleCreateWorkspace = async (name: string, description: string) => {
    try {
      haptic.selection()

      const result = await createWorkspaceMutation.mutateAsync({
        name,
        description,
        type: 'shared'
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to create workspace:', error)
      haptic.error()
    }
  }

  const handleToggleCollaboration = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ collaborationEnabled: enabled })
      setCollaborationEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle collaboration:', error)
    }
  }

  const getTeamStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Aktiv', icon: Users }
      case 'inactive': return { color: 'text-red-600', label: 'Inaktiv', icon: UserX }
      case 'pending': return { color: 'text-yellow-600', label: 'Venter', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  const getWorkspaceStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Aktiv', icon: Folder }
      case 'inactive': return { color: 'text-red-600', label: 'Inaktiv', icon: XCircle }
      case 'shared': return { color: 'text-blue-600', label: 'Delt', icon: Share2 }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Collaboration</h2>
          <p className="text-muted-foreground">
            Team management, shared workspaces og real-time collaboration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Teams Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Chat Active
          </Badge>
        </div>
      </div>

      {/* Collaboration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teamsQuery.data?.activeTeams || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Teams active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Workspaces</CardTitle>
            <Folder className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {workspacesQuery.data?.sharedWorkspaces || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Workspaces shared
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {chatQuery.data?.onlineUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Users online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaboration Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.collaborationScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Collaboration effectiveness
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'teams' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('teams')}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Teams
        </Button>
        <Button
          variant={selectedTab === 'workspaces' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('workspaces')}
          className="flex-1"
        >
          <Folder className="w-4 h-4 mr-2" />
          Workspaces
        </Button>
        <Button
          variant={selectedTab === 'chat' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('chat')}
          className="flex-1"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
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

      {/* Teams Tab */}
      {selectedTab === 'teams' && (
        <div className="space-y-4">
          {/* Team Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Create og manage teams for collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamsQuery.data?.teams?.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{team.memberCount} members</div>
                        <div className="text-xs text-muted-foreground">
                          {team.type}
                        </div>
                      </div>

                      <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                        {team.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamsQuery.data?.teamMembers?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{member.role}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.status}
                        </div>
                      </div>

                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workspaces Tab */}
      {selectedTab === 'workspaces' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Shared Workspaces
              </CardTitle>
              <CardDescription>
                Manage shared workspaces for team collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workspacesQuery.data?.workspaces?.map((workspace) => (
                  <div key={workspace.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Folder className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{workspace.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workspace.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{workspace.itemCount} items</div>
                        <div className="text-xs text-muted-foreground">
                          {workspace.type}
                        </div>
                      </div>

                      <Badge variant={workspace.status === 'active' ? 'default' : 'secondary'}>
                        {workspace.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workspace Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Workspace Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {workspacesQuery.data?.workspaceAnalytics?.map((analytic) => (
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

      {/* Chat Tab */}
      {selectedTab === 'chat' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Real-time Chat
              </CardTitle>
              <CardDescription>
                Real-time messaging og collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatQuery.data?.chatChannels?.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{channel.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {channel.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{channel.memberCount} members</div>
                        <div className="text-xs text-muted-foreground">
                          {channel.lastMessage}
                        </div>
                      </div>

                      <Badge variant={channel.isActive ? 'default' : 'secondary'}>
                        {channel.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Chat Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatQuery.data?.chatAnalytics?.map((analytic) => (
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
                Collaboration Settings
              </CardTitle>
              <CardDescription>
                Configure collaboration preferences
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
                        if (setting.key === 'collaborationEnabled') {
                          handleToggleCollaboration(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Collaboration Preferences
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
              <Users className="w-5 h-5" />
              <span className="text-sm">Create Team</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Folder className="w-5 h-5" />
              <span className="text-sm">New Workspace</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">Start Chat</span>
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
