'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  BarChart3,
  Settings,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
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
  Target,
  MessageSquare,
  Phone,
  FileText,
  Music,
  Video,
  Gamepad2,
  Workflow,
  Cpu,
  Code,
  Terminal,
  Clock,
  Webhook,
  Network,
  Gauge,
  HardDrive,
  PieChart,
  LineChart,
  TrendingDown,
  BarChart,
  Wallet,
  Coins,
  Bitcoin,
  Zap
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedBlockchainProps {
  className?: string
}

export function AdvancedBlockchain({ className }: AdvancedBlockchainProps) {
  const [selectedTab, setSelectedTab] = useState<'contracts' | 'processing' | 'integration' | 'settings'>('contracts')
  const [isRunning, setIsRunning] = useState(false)
  const [blockchainEnabled, setBlockchainEnabled] = useState(true)
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Blockchain queries
  const contractsQuery = trpc.blockchain.getContractsData.useQuery()
  const processingQuery = trpc.blockchain.getProcessingData.useQuery()
  const integrationQuery = trpc.blockchain.getIntegrationData.useQuery()
  const settingsQuery = trpc.blockchain.getBlockchainSettings.useQuery()

  const deployContractMutation = trpc.blockchain.deployContract.useMutation()
  const startProcessingMutation = trpc.blockchain.startProcessing.useMutation()
  const syncDeFiMutation = trpc.blockchain.syncDeFi.useMutation()
  const updateSettingsMutation = trpc.blockchain.updateSettings.useMutation()

  const handleDeployContract = async (contractData: any) => {
    try {
      setIsRunning(true)
      haptic.selection()

      const result = await deployContractMutation.mutateAsync(contractData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to deploy contract:', error)
      haptic.error()
    } finally {
      setIsRunning(false)
    }
  }

  const handleStartProcessing = async (processingData: any) => {
    try {
      haptic.selection()

      const result = await startProcessingMutation.mutateAsync(processingData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start processing:', error)
      haptic.error()
    }
  }

  const handleSyncDeFi = async (syncData: any) => {
    try {
      haptic.selection()

      const result = await syncDeFiMutation.mutateAsync(syncData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to sync DeFi:', error)
      haptic.error()
    }
  }

  const handleToggleBlockchain = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ blockchainEnabled: enabled })
      setBlockchainEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle blockchain:', error)
    }
  }

  const getContractStatus = (status: string) => {
    switch (status) {
      case 'deployed': return { color: 'text-green-600', label: 'Deployed', icon: CheckCircle }
      case 'deploying': return { color: 'text-blue-600', label: 'Deploying', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'pending': return { color: 'text-yellow-600', label: 'Pending', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getProcessingStatus = (status: string) => {
    switch (status) {
      case 'running': return { color: 'text-green-600', label: 'Running', icon: CheckCircle }
      case 'queued': return { color: 'text-yellow-600', label: 'Queued', icon: Clock }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'completed': return { color: 'text-blue-600', label: 'Completed', icon: CheckSquare }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Blockchain</h2>
          <p className="text-muted-foreground">
            Smart contract management, blockchain processing og DeFi integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Blockchain Active
          </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              Smart Contracts Ready
            </Badge>
        </div>
      </div>

      {/* Blockchain Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {contractsQuery.data?.activeContracts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployed contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Processing</CardTitle>
            <Cpu className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {processingQuery.data?.activeProcesses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Running processes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DeFi Sync</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {integrationQuery.data?.defiSyncs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active syncs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settingsQuery.data?.blockchainScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                  <Button
            variant={selectedTab === 'contracts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('contracts')}
            className="flex-1"
          >
            <Award className="w-4 h-4 mr-2" />
            Contracts
          </Button>
          <Button
            variant={selectedTab === 'processing' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('processing')}
            className="flex-1"
          >
            <Cpu className="w-4 h-4 mr-2" />
            Processing
          </Button>
          <Button
            variant={selectedTab === 'integration' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('integration')}
            className="flex-1"
          >
            <Globe className="w-4 h-4 mr-2" />
            Integration
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

      {/* Contracts Tab */}
      {selectedTab === 'contracts' && (
        <div className="space-y-4">
          {/* Smart Contract Management */}
          <Card>
            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Smart Contract Management
                </CardTitle>
              <CardDescription>
                Deploy og manage smart contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractsQuery.data?.contracts?.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <contract.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contract.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contract.description} • {contract.network}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{contract.address}</div>
                        <div className="text-xs text-muted-foreground">
                          {contract.deployed}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeployContract({ contractId: contract.id, action: 'deploy' })}
                        variant="outline"
                        size="sm"
                      >
                        <Rocket className="w-4 h-4" />
                      </Button>

                      <Badge variant={contract.status === 'deployed' ? 'default' : 'secondary'}>
                        {contract.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Contract Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {contractsQuery.data?.contractAnalytics?.map((analytic) => (
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

      {/* Processing Tab */}
      {selectedTab === 'processing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Blockchain Processing
                </CardTitle>
              <CardDescription>
                Manage blockchain processing tasks og workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingQuery.data?.processes?.map((process) => (
                  <div key={process.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <process.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{process.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {process.description} • {process.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{process.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {process.resources} resources
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartProcessing({ processId: process.id, action: 'start' })}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <Badge variant={process.status === 'running' ? 'default' : 'secondary'}>
                        {process.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processing Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Processing Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingQuery.data?.processingAnalytics?.map((analytic) => (
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

      {/* Integration Tab */}
      {selectedTab === 'integration' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  DeFi Integration
                </CardTitle>
              <CardDescription>
                Manage DeFi synchronization og data flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationQuery.data?.syncs?.map((sync) => (
                  <div key={sync.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <sync.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{sync.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sync.description} • {sync.frequency}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{sync.dataSize}</div>
                        <div className="text-xs text-muted-foreground">
                          {sync.lastSync}
                        </div>
                      </div>

                                              <Button
                          onClick={() => handleSyncDeFi({ syncId: sync.id, action: 'sync' })}
                          variant="outline"
                          size="sm"
                        >
                          <Globe className="w-4 h-4" />
                        </Button>

                      <Badge variant={sync.status === 'synced' ? 'default' : 'secondary'}>
                        {sync.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Integration Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {integrationQuery.data?.integrationAnalytics?.map((analytic) => (
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
                Blockchain Settings
              </CardTitle>
              <CardDescription>
                Configure your blockchain preferences
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
                        if (setting.key === 'blockchainEnabled') {
                          handleToggleBlockchain(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Blockchain Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.blockchainGoals?.map((goal) => (
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
                <Award className="w-5 h-5" />
                <span className="text-sm">Deploy Contract</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Cpu className="w-5 h-5" />
                <span className="text-sm">Start Processing</span>
              </Button>
                          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Globe className="w-5 h-5" />
                <span className="text-sm">Sync DeFi</span>
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
