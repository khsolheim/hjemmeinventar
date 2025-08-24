'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ShoppingCart,
  Calendar,
  Mail,
  Cloud,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  ExternalLink,
  Download,
  Upload,
  Sync,
  Bell,
  CreditCard,
  Package,
  Truck,
  Star,
  TrendingUp
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface ThirdPartyIntegrationsProps {
  className?: string
}

export function ThirdPartyIntegrations({ className }: ThirdPartyIntegrationsProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupData, setSetupData] = useState({
    name: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: ''
  })
  const haptic = useHapticFeedback()

  // Integration queries
  const integrationsQuery = trpc.integrations.getThirdPartyIntegrations.useQuery()
  const syncStatusQuery = trpc.integrations.getSyncStatus.useQuery()
  const webhooksQuery = trpc.integrations.getWebhooks.useQuery()

  const addIntegrationMutation = trpc.integrations.addThirdPartyIntegration.useMutation()
  const syncDataMutation = trpc.integrations.syncData.useMutation()
  const toggleIntegrationMutation = trpc.integrations.toggleIntegration.useMutation()

  const handleAddIntegration = async () => {
    haptic.success()
    try {
      await addIntegrationMutation.mutateAsync({
        type: selectedIntegration!,
        name: setupData.name,
        config: {
          apiKey: setupData.apiKey,
          apiSecret: setupData.apiSecret,
          webhookUrl: setupData.webhookUrl
        }
      })
      setShowSetupModal(false)
      setSetupData({ name: '', apiKey: '', apiSecret: '', webhookUrl: '' })
    } catch (error) {
      console.error('Failed to add integration:', error)
    }
  }

  const handleSyncData = async (integrationId: string) => {
    haptic.light()
    try {
      await syncDataMutation.mutateAsync({ integrationId })
    } catch (error) {
      console.error('Failed to sync data:', error)
    }
  }

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    haptic.selection()
    try {
      await toggleIntegrationMutation.mutateAsync({ integrationId, enabled })
    } catch (error) {
      console.error('Failed to toggle integration:', error)
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'amazon': return ShoppingCart
      case 'google_calendar': return Calendar
      case 'gmail': return Mail
      case 'dropbox': return Cloud
      case 'shopify': return Package
      case 'klarna': return CreditCard
      case 'postnord': return Truck
      case 'trustpilot': return Star
      default: return ExternalLink
    }
  }

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'amazon': return 'text-orange-600'
      case 'google_calendar': return 'text-blue-600'
      case 'gmail': return 'text-red-600'
      case 'dropbox': return 'text-blue-500'
      case 'shopify': return 'text-green-600'
      case 'klarna': return 'text-pink-600'
      case 'postnord': return 'text-yellow-600'
      case 'trustpilot': return 'text-green-500'
      default: return 'text-gray-600'
    }
  }

  const getSyncStatus = (status: string) => {
    switch (status) {
      case 'synced': return { label: 'Synkronisert', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'syncing': return { label: 'Synkroniserer', color: 'bg-blue-100 text-blue-800', icon: RefreshCw }
      case 'error': return { label: 'Feil', color: 'bg-red-100 text-red-800', icon: XCircle }
      case 'pending': return { label: 'Venter', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
      default: return { label: 'Ukjent', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    }
  }

  const integrations = [
    {
      id: 'amazon',
      name: 'Amazon',
      description: 'Synkroniser ordrer og produktdata',
      icon: ShoppingCart,
      color: 'text-orange-600',
      features: ['Ordre-synkronisering', 'Produktdata', 'Lagerstatus', 'Priser']
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Synkroniser kalender og hendelser',
      icon: Calendar,
      color: 'text-blue-600',
      features: ['Kalender-synkronisering', 'Hendelser', 'Påminnelser', 'Deling']
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'E-post integrasjon og notifikasjoner',
      icon: Mail,
      color: 'text-red-600',
      features: ['E-post notifikasjoner', 'Automatiske svar', 'Filtrering', 'Arkivering']
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Fil-synkronisering og backup',
      icon: Cloud,
      color: 'text-blue-500',
      features: ['Fil-synkronisering', 'Automatisk backup', 'Deling', 'Versjonering']
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'E-handel integrasjon',
      icon: Package,
      color: 'text-green-600',
      features: ['Produkt-synkronisering', 'Ordre-håndtering', 'Kunde-data', 'Analytics']
    },
    {
      id: 'klarna',
      name: 'Klarna',
      description: 'Betaling og fakturering',
      icon: CreditCard,
      color: 'text-pink-600',
      features: ['Betalinger', 'Fakturering', 'Refusjoner', 'Rapporter']
    },
    {
      id: 'postnord',
      name: 'PostNord',
      description: 'Frakt og sporing',
      icon: Truck,
      color: 'text-yellow-600',
      features: ['Frakt-kalkulering', 'Sporing', 'Levering', 'Retur']
    },
    {
      id: 'trustpilot',
      name: 'Trustpilot',
      description: 'Anmeldelser og feedback',
      icon: Star,
      color: 'text-green-500',
      features: ['Anmeldelser', 'Feedback', 'Rating', 'Rapporter']
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tredjeparts-integrasjoner</h2>
          <p className="text-muted-foreground">
            Koble til eksterne tjenester og synkroniser data
          </p>
        </div>
        <Button
          onClick={() => setShowSetupModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Legg til integrasjon
        </Button>
      </div>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Tilgjengelige integrasjoner
          </CardTitle>
          <CardDescription>
            Velg hvilke eksterne tjenester du vil koble til
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.map((integration) => {
              const IconComponent = integration.icon
              const isConnected = integrationsQuery.data?.some(i => i.type === integration.id)

              return (
                <div
                  key={integration.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isConnected
                      ? 'border-green-500 bg-green-50'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedIntegration(integration.id)
                    setShowSetupModal(true)
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent className={`w-6 h-6 ${integration.color}`} />
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {integration.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {integration.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {feature}
                      </div>
                    ))}
                    {integration.features.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{integration.features.length - 2} flere funksjoner
                      </div>
                    )}
                  </div>

                  {isConnected && (
                    <Badge className="mt-3 bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Tilkoblet
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      {integrationsQuery.data && integrationsQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sync className="w-5 h-5" />
              Tilkoblede integrasjoner
            </CardTitle>
            <CardDescription>
              Administrer dine aktive integrasjoner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrationsQuery.data.map((integration) => {
                const IconComponent = getIntegrationIcon(integration.type)
                const syncStatus = getSyncStatus(integration.syncStatus)
                const StatusIcon = syncStatus.icon

                return (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-8 h-8 ${getIntegrationColor(integration.type)}`} />
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.type} • Sist synkronisert: {new Date(integration.lastSync).toLocaleDateString('no-NO')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={syncStatus.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {syncStatus.label}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncData(integration.id)}
                        disabled={syncStatusQuery.data?.syncing}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Synkroniser
                      </Button>
                      
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={(enabled) => handleToggleIntegration(integration.id, enabled)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Status Overview */}
      {syncStatusQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Synkroniseringsstatus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {syncStatusQuery.data.synced}
                </div>
                <div className="text-sm text-muted-foreground">
                  Synkronisert
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {syncStatusQuery.data.syncing}
                </div>
                <div className="text-sm text-muted-foreground">
                  Synkroniserer
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {syncStatusQuery.data.errors}
                </div>
                <div className="text-sm text-muted-foreground">
                  Feil
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {syncStatusQuery.data.pending}
                </div>
                <div className="text-sm text-muted-foreground">
                  Venter
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhooks */}
      {webhooksQuery.data && webhooksQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Konfigurerte webhooks for real-time oppdateringer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhooksQuery.data.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{webhook.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {webhook.url} • {webhook.events.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={webhook.active ? "default" : "secondary"}>
                      {webhook.active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Modal */}
      {showSetupModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Legg til {integrations.find(i => i.id === selectedIntegration)?.name}</CardTitle>
              <CardDescription>
                Konfigurer tilkobling til ekstern tjeneste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={setupData.name}
                  onChange={(e) => setSetupData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="F.eks. Min Amazon integrasjon"
                />
              </div>
              
              <div>
                <Label htmlFor="apiKey">API Nøkkel</Label>
                <Input
                  id="apiKey"
                  value={setupData.apiKey}
                  onChange={(e) => setSetupData(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="API nøkkel fra tjenesten"
                />
              </div>
              
              <div>
                <Label htmlFor="apiSecret">API Hemmelighet</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  value={setupData.apiSecret}
                  onChange={(e) => setSetupData(prev => ({ ...prev, apiSecret: e.target.value }))}
                  placeholder="API hemmelighet fra tjenesten"
                />
              </div>
              
              <div>
                <Label htmlFor="webhookUrl">Webhook URL (valgfritt)</Label>
                <Input
                  id="webhookUrl"
                  value={setupData.webhookUrl}
                  onChange={(e) => setSetupData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://din-app.com/webhook"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddIntegration}
                  disabled={!setupData.name || !setupData.apiKey || addIntegrationMutation.isLoading}
                  className="flex-1"
                >
                  Legg til integrasjon
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSetupModal(false)}
                >
                  Avbryt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
