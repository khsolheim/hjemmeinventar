'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Link,
  Coins,
  Wallet,
  Smartphone,
  Database,
  Network,
  Globe,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Database as Blockchain,
  Network as NetworkIcon,
  Globe as Web3,
  Shield as Security,
  Lock as Privacy,
  Key as Crypto,
  Fingerprint as NFT,
  AlertTriangle as Warning,
  CheckCircle as Verified,
  XCircle as Failed,
  Clock as Pending,
  Settings as Config,
  RefreshCw as Sync,
  Download as Import,
  Upload as Export,
  Database as Storage,
  Network as Connection,
  Globe as Internet,
  Shield as Protection,
  Lock as Encryption,
  Key as KeyIcon,
  Fingerprint as Biometric,
  AlertTriangle as Error,
  CheckCircle as Success,
  XCircle as Cancel,
  Clock as Time,
  Settings as Setup,
  RefreshCw as Update,
  Download as Get,
  Upload as Send,
  Database as Data,
  Network as Net,
  Globe as World,
  Shield as Guard,
  Lock as Secure,
  Key as Access,
  Fingerprint as Identity,
  AlertTriangle as Notice,
  CheckCircle as Done,
  XCircle as Stop,
  Clock as Schedule,
  Settings as Options,
  RefreshCw as Reload,
  Download as Save,
  Upload as Share
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface BlockchainIntegrationProps {
  className?: string
}

export function BlockchainIntegration({ className }: BlockchainIntegrationProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'nfts' | 'smart-contracts' | 'decentralized'>('overview')
  const [showPrivateKeys, setShowPrivateKeys] = useState(false)
  const haptic = useHapticFeedback()

  // Blockchain queries
  const blockchainQuery = trpc.blockchain.getBlockchainStatus.useQuery()
  const nftsQuery = trpc.blockchain.getNFTs.useQuery()
  const contractsQuery = trpc.blockchain.getSmartContracts.useQuery()
  const decentralizedQuery = trpc.blockchain.getDecentralizedData.useQuery()

  const createNFTMutation = trpc.blockchain.createNFT.useMutation()
  const deployContractMutation = trpc.blockchain.deployContract.useMutation()
  const syncDataMutation = trpc.blockchain.syncData.useMutation()

  const handleCreateNFT = async (itemId: string) => {
    haptic.success()
    try {
      await createNFTMutation.mutateAsync({ itemId })
    } catch (error) {
      console.error('Failed to create NFT:', error)
    }
  }

  const handleDeployContract = async (contractData: any) => {
    haptic.light()
    try {
      await deployContractMutation.mutateAsync(contractData)
    } catch (error) {
      console.error('Failed to deploy contract:', error)
    }
  }

  const handleSyncData = async () => {
    haptic.selection()
    try {
      await syncDataMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to sync data:', error)
    }
  }

  const getBlockchainStatus = (status: string) => {
    switch (status) {
      case 'connected': return { color: 'text-green-600', label: 'Tilkoblet', icon: CheckCircle }
      case 'syncing': return { color: 'text-yellow-600', label: 'Synkroniserer', icon: RefreshCw }
      case 'disconnected': return { color: 'text-red-600', label: 'Frakoblet', icon: XCircle }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  const getNFTStatus = (status: string) => {
    switch (status) {
      case 'minted': return { color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      case 'failed': return { color: 'bg-red-100 text-red-800', icon: XCircle }
      default: return { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blockchain Integration</h2>
          <p className="text-muted-foreground">
            NFTs, Smart Contracts og desentraliserte funksjoner
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Link className="w-3 h-3" />
            Web3 Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Coins className="w-3 h-3" />
            Multi-Chain
          </Badge>
        </div>
      </div>

      {/* Blockchain Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Status</CardTitle>
            <Link className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {blockchainQuery.data?.status || 'Connected'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getBlockchainStatus(blockchainQuery.data?.status || 'connected').label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFTs</CardTitle>
            <Fingerprint className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {nftsQuery.data?.totalNFTs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Minted tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Contracts</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {contractsQuery.data?.deployedContracts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployed contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Used</CardTitle>
            <Coins className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {blockchainQuery.data?.gasUsed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total gas consumed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('overview')}
          className="flex-1"
        >
          <Link className="w-4 h-4 mr-2" />
          Oversikt
        </Button>
        <Button
          variant={selectedTab === 'nfts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('nfts')}
          className="flex-1"
        >
          <Fingerprint className="w-4 h-4 mr-2" />
          NFTs
        </Button>
        <Button
          variant={selectedTab === 'smart-contracts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('smart-contracts')}
          className="flex-1"
        >
          <Database className="w-4 h-4 mr-2" />
          Smart Contracts
        </Button>
        <Button
          variant={selectedTab === 'decentralized' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('decentralized')}
          className="flex-1"
        >
          <Globe className="w-4 h-4 mr-2" />
          Desentralisert
        </Button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Blockchain Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Blockchain Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blockchainQuery.data?.networks?.map((network) => {
                    const status = getBlockchainStatus(network.status)
                    const StatusIcon = status.icon
                    
                    return (
                      <div key={network.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          <span className="text-sm">{network.name}</span>
                        </div>
                        <Badge className={status.color.replace('text-', 'bg-').replace('-600', '-100') + ' ' + status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Siste transaksjoner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blockchainQuery.data?.recentTransactions?.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{tx.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                        </div>
                      </div>
                      <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                        {tx.status === 'confirmed' ? 'Bekreftet' : 'Venter'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* NFTs Tab */}
      {selectedTab === 'nfts' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                NFT Collection
              </CardTitle>
              <CardDescription>
                Dine mintede NFTs og digitale eiendeler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nftsQuery.data?.nfts?.map((nft) => {
                  const status = getNFTStatus(nft.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={nft.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Fingerprint className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{nft.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Token ID: {nft.tokenId}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{nft.value} ETH</div>
                          <div className="text-xs text-muted-foreground">
                            {nft.blockchain}
                          </div>
                        </div>
                        
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {nft.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Contracts Tab */}
      {selectedTab === 'smart-contracts' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Smart Contracts
              </CardTitle>
              <CardDescription>
                Deployede smart contracts og automatiseringer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractsQuery.data?.contracts?.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Database className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contract.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contract.address.substring(0, 8)}...{contract.address.substring(contract.address.length - 8)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{contract.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {contract.blockchain}
                        </div>
                      </div>
                      
                      <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Decentralized Tab */}
      {selectedTab === 'decentralized' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Decentralized Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Desentralisert lagring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {decentralizedQuery.data?.storage?.map((storage) => (
                    <div key={storage.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{storage.name}</span>
                        <span className="text-sm font-medium">{storage.used} / {storage.total}</span>
                      </div>
                      <Progress value={(storage.used / storage.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decentralized Identity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Desentralisert identitet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {decentralizedQuery.data?.identity?.map((identity) => (
                    <div key={identity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{identity.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {identity.did}
                        </div>
                      </div>
                      <Badge variant={identity.verified ? 'default' : 'secondary'}>
                        {identity.verified ? 'Verifisert' : 'Ikke verifisert'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Decentralized Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Desentraliserte handlinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Fingerprint className="w-5 h-5" />
                  <span className="text-sm">Mint NFT</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Database className="w-5 h-5" />
                  <span className="text-sm">Deploy Contract</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Globe className="w-5 h-5" />
                  <span className="text-sm">Sync Data</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Key className="w-5 h-5" />
                  <span className="text-sm">Manage Keys</span>
                </Button>
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
              <Link className="w-5 h-5" />
              <span className="text-sm">Connect Wallet</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Sync Blockchain</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Export Keys</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">View Explorer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
