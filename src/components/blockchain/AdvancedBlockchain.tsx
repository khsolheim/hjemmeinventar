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
  Api,
  Database as Db,
  Network,
  Gauge,
  HardDrive,
  Memory,
  Cpu as Processor,
  Wifi as NetworkIcon,
  HardDrive as Storage,
  Activity as Performance,
  PieChart,
  LineChart,
  TrendingDown,
  Download as Export,
  FileText as Report,
  BarChart,
  PieChart as Chart,
  Activity as Analytics,
  Link,
  Wallet,
  Coins,
  Bitcoin,
  Ethereum,
  Zap as Lightning,
  Shield as Security,
  Lock as Privacy,
  Globe as Web3,
  Database as Blockchain,
  Network as DeFi,
  Activity as Mining,
  Timer as Gas,
  DollarSign as Token,
  Star as NFT,
  Award as SmartContract,
  Trophy as Governance,
  Crown as DAO,
  Rocket as Deploy,
  Sparkles as Mint,
  CheckSquare as Verify,
  Target as Consensus,
  MessageSquare as Transaction,
  Phone as Mobile,
  FileText as Document,
  Music as Audio,
  Video as Media,
  Gamepad2 as Gaming,
  Workflow as Workflow,
  Cpu as Compute,
  Code as Code,
  Terminal as CLI,
  Clock as Time,
  Webhook as Webhook,
  Api as API,
  Database as Storage,
  Network as Network,
  Gauge as Metrics,
  HardDrive as Storage,
  Memory as Memory,
  Cpu as CPU,
  Wifi as WiFi,
  HardDrive as Disk,
  Activity as Activity,
  PieChart as Chart,
  LineChart as Trend,
  TrendingDown as Decline,
  Download as Download,
  FileText as File,
  BarChart as Graph,
  PieChart as Circle,
  Activity as Monitor,
  Link as Connect,
  Wallet as Wallet,
  Coins as Coins,
  Bitcoin as BTC,
  Ethereum as ETH,
  Zap as Lightning,
  Shield as Security,
  Lock as Privacy,
  Globe as Web3,
  Database as Chain,
  Network as Network,
  Activity as Mining,
  Timer as Gas,
  DollarSign as Money,
  Star as NFT,
  Award as Contract,
  Trophy as Governance,
  Crown as DAO,
  Rocket as Deploy,
  Sparkles as Mint,
  CheckSquare as Verify,
  Target as Consensus,
  MessageSquare as Message,
  Phone as Mobile,
  FileText as Document,
  Music as Audio,
  Video as Media,
  Gamepad2 as Gaming,
  Workflow as Workflow,
  Cpu as Compute,
  Code as Code,
  Terminal as CLI,
  Clock as Time,
  Webhook as Webhook,
  Api as API,
  Database as Storage,
  Network as Network,
  Gauge as Metrics,
  HardDrive as Storage,
  Memory as Memory,
  Cpu as CPU,
  Wifi as WiFi,
  HardDrive as Disk,
  Activity as Activity,
  PieChart as Chart,
  LineChart as Trend,
  TrendingDown as Decline,
  Download as Download,
  FileText as File,
  BarChart as Graph,
  PieChart as Circle,
  Activity as Monitor
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedBlockchainProps {
  className?: string
}

export function AdvancedBlockchain({ className }: AdvancedBlockchainProps) {
  const [selectedTab, setSelectedTab] = useState<'nfts' | 'contracts' | 'web3' | 'settings'>('nfts')
  const [isMinting, setIsMinting] = useState(false)
  const [blockchainEnabled, setBlockchainEnabled] = useState(true)
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Blockchain queries
  const nftsQuery = trpc.blockchain.getNFTsData.useQuery()
  const contractsQuery = trpc.blockchain.getContractsData.useQuery()
  const web3Query = trpc.blockchain.getWeb3Data.useQuery()
  const settingsQuery = trpc.blockchain.getBlockchainSettings.useQuery()

  const mintNFTMutation = trpc.blockchain.mintNFT.useMutation()
  const deployContractMutation = trpc.blockchain.deployContract.useMutation()
  const connectWalletMutation = trpc.blockchain.connectWallet.useMutation()
  const updateSettingsMutation = trpc.blockchain.updateSettings.useMutation()

  const handleMintNFT = async (nftData: any) => {
    try {
      setIsMinting(true)
      haptic.selection()

      const result = await mintNFTMutation.mutateAsync(nftData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to mint NFT:', error)
      haptic.error()
    } finally {
      setIsMinting(false)
    }
  }

  const handleDeployContract = async (contractData: any) => {
    try {
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
    }
  }

  const handleConnectWallet = async (walletData: any) => {
    try {
      haptic.selection()

      const result = await connectWalletMutation.mutateAsync(walletData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
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

  const getNFTStatus = (status: string) => {
    switch (status) {
      case 'minted': return { color: 'text-green-600', label: 'Minted', icon: CheckCircle }
      case 'minting': return { color: 'text-blue-600', label: 'Minting', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'pending': return { color: 'text-yellow-600', label: 'Pending', icon: Clock }
      default: return { color: 'text-gray-600', label: 'Unknown', icon: Info }
    }
  }

  const getContractStatus = (status: string) => {
    switch (status) {
      case 'deployed': return { color: 'text-green-600', label: 'Deployed', icon: CheckCircle }
      case 'deploying': return { color: 'text-blue-600', label: 'Deploying', icon: RefreshCw }
      case 'failed': return { color: 'text-red-600', label: 'Failed', icon: XCircle }
      case 'testing': return { color: 'text-purple-600', label: 'Testing', icon: Code }
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
            NFT management, smart contracts og Web3 integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Blockchain className="w-3 h-3" />
            Blockchain Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Web3 className="w-3 h-3" />
            Web3 Ready
          </Badge>
        </div>
      </div>

      {/* Blockchain Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {nftsQuery.data?.totalNFTs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Minted NFTs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Contracts</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contractsQuery.data?.totalContracts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployed contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {web3Query.data?.connectedWallets || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Price</CardTitle>
            <Timer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {web3Query.data?.gasPrice || 0} Gwei
            </div>
            <p className="text-xs text-muted-foreground">
              Current gas price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'nfts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('nfts')}
          className="flex-1"
        >
          <Star className="w-4 h-4 mr-2" />
          NFTs
        </Button>
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
          variant={selectedTab === 'web3' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('web3')}
          className="flex-1"
        >
          <Web3 className="w-4 h-4 mr-2" />
          Web3
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

      {/* NFTs Tab */}
      {selectedTab === 'nfts' && (
        <div className="space-y-4">
          {/* NFT Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                NFT Management
              </CardTitle>
              <CardDescription>
                Create og manage your NFTs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nftsQuery.data?.nfts?.map((nft) => (
                  <div key={nft.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <nft.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{nft.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {nft.description} • {nft.tokenId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{nft.price} ETH</div>
                        <div className="text-xs text-muted-foreground">
                          {nft.mintDate}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleMintNFT({ nftId: nft.id, action: 'mint' })}
                        variant="outline"
                        size="sm"
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>

                      <Badge variant={nft.status === 'minted' ? 'default' : 'secondary'}>
                        {nft.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NFT Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                NFT Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {nftsQuery.data?.nftAnalytics?.map((analytic) => (
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

      {/* Contracts Tab */}
      {selectedTab === 'contracts' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Smart Contracts
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
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <contract.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contract.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contract.description} • {contract.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{contract.gasUsed} gas</div>
                        <div className="text-xs text-muted-foreground">
                          {contract.deployDate}
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
                <PieChart className="w-5 h-5" />
                Contract Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractsQuery.data?.contractAnalytics?.map((analytic) => (
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

      {/* Web3 Tab */}
      {selectedTab === 'web3' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Web3 className="w-5 h-5" />
                Web3 Integration
              </CardTitle>
              <CardDescription>
                Connect wallets og manage Web3 features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {web3Query.data?.wallets?.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <wallet.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{wallet.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {wallet.description} • {wallet.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{wallet.balance} ETH</div>
                        <div className="text-xs text-muted-foreground">
                          {wallet.lastConnected}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleConnectWallet({ walletId: wallet.id, action: 'connect' })}
                        variant="outline"
                        size="sm"
                      >
                        <Link className="w-4 h-4" />
                      </Button>

                      <Badge variant={wallet.status === 'connected' ? 'default' : 'secondary'}>
                        {wallet.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Web3 Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Web3 Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {web3Query.data?.web3Analytics?.map((analytic) => (
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
              <Star className="w-5 h-5" />
              <span className="text-sm">Mint NFT</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">Deploy Contract</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm">Connect Wallet</span>
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
