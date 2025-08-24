'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Home,
  Lightbulb,
  Wifi,
  Settings,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Volume2,
  Smartphone,
  Globe,
  Shield,
  Clock
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface SmartHomeIntegrationProps {
  className?: string
}

export function SmartHomeIntegration({ className }: SmartHomeIntegrationProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<'hue' | 'tradfri' | 'alexa' | null>(null)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupData, setSetupData] = useState({
    name: '',
    ip: '',
    token: '',
    username: ''
  })
  const haptic = useHapticFeedback()

  // Integration queries
  const integrationsQuery = trpc.integrations.getIntegrations.useQuery()
  const devicesQuery = trpc.integrations.getDevices.useQuery()
  const automationsQuery = trpc.integrations.getAutomations.useQuery()

  const addIntegrationMutation = trpc.integrations.addIntegration.useMutation()
  const toggleDeviceMutation = trpc.integrations.toggleDevice.useMutation()
  const createAutomationMutation = trpc.integrations.createAutomation.useMutation()

  const handleAddIntegration = async () => {
    haptic.success()
    try {
      await addIntegrationMutation.mutateAsync({
        type: selectedIntegration!,
        name: setupData.name,
        config: {
          ip: setupData.ip,
          token: setupData.token,
          username: setupData.username
        }
      })
      setShowSetupModal(false)
      setSetupData({ name: '', ip: '', token: '', username: '' })
    } catch (error) {
      console.error('Failed to add integration:', error)
    }
  }

  const handleToggleDevice = async (deviceId: string, state: boolean) => {
    haptic.light()
    try {
      await toggleDeviceMutation.mutateAsync({
        deviceId,
        state
      })
    } catch (error) {
      console.error('Failed to toggle device:', error)
    }
  }

  const handleCreateAutomation = async (automation: any) => {
    haptic.success()
    try {
      await createAutomationMutation.mutateAsync(automation)
    } catch (error) {
      console.error('Failed to create automation:', error)
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'philips_hue': return Lightbulb
      case 'ikea_tradfri': return Home
      case 'amazon_alexa': return Volume2
      default: return Wifi
    }
  }

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'philips_hue': return 'text-orange-600'
      case 'ikea_tradfri': return 'text-blue-600'
      case 'amazon_alexa': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getDeviceStatus = (status: string) => {
    switch (status) {
      case 'online': return { label: 'Online', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'offline': return { label: 'Offline', color: 'bg-red-100 text-red-800', icon: XCircle }
      case 'error': return { label: 'Feil', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
      default: return { label: 'Ukjent', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    }
  }

  const integrations = [
    {
      id: 'philips_hue',
      name: 'Philips Hue',
      description: 'Kontroller smarte lys og sensorer',
      icon: Lightbulb,
      color: 'text-orange-600',
      features: ['Lys-kontroll', 'Sensorer', 'Scener', 'Automatisering']
    },
    {
      id: 'ikea_tradfri',
      name: 'IKEA Trådfri',
      description: 'Styr IKEA smarte produkter',
      icon: Home,
      color: 'text-blue-600',
      features: ['Lys', 'Stikkontakter', 'Sensorer', 'Fjernkontroller']
    },
    {
      id: 'amazon_alexa',
      name: 'Amazon Alexa',
      description: 'Stemme-kontroll og automatisering',
      icon: Volume2,
      color: 'text-purple-600',
      features: ['Stemme-kommandoer', 'Rutiner', 'Smart Home', 'Notifikasjoner']
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Home Integrasjoner</h2>
          <p className="text-muted-foreground">
            Koble til smarte hjem-systemer og automatisering
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
            <Globe className="w-5 h-5" />
            Tilgjengelige integrasjoner
          </CardTitle>
          <CardDescription>
            Velg hvilke smarte hjem-systemer du vil koble til
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    setSelectedIntegration(integration.id as any)
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
                    {integration.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {feature}
                      </div>
                    ))}
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

      {/* Connected Devices */}
      {devicesQuery.data && devicesQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Tilkoblede enheter
            </CardTitle>
            <CardDescription>
              Kontroller dine smarte hjem-enheter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devicesQuery.data.map((device) => {
                const status = getDeviceStatus(device.status)
                const StatusIcon = status.icon

                return (
                  <div key={device.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <device.icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {device.type} • {device.integration}
                      </div>
                      
                      {device.type === 'light' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Lys</span>
                          <Switch
                            checked={device.state}
                            onCheckedChange={(checked) => handleToggleDevice(device.id, checked)}
                          />
                        </div>
                      )}
                      
                      {device.type === 'sensor' && (
                        <div className="text-sm">
                          Verdi: {device.value} {device.unit}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automations */}
      {automationsQuery.data && automationsQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Automatiseringer
            </CardTitle>
            <CardDescription>
              Automatiske handlinger basert på hendelser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automationsQuery.data.map((automation) => (
                <div key={automation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{automation.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {automation.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={automation.enabled ? "default" : "secondary"}>
                      {automation.enabled ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                    <Switch
                      checked={automation.enabled}
                      onCheckedChange={(enabled) => {
                        // Toggle automation
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm">Alle lys av</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Home className="w-5 h-5" />
              <span className="text-sm">Hjem-modus</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Natt-modus</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Sikkerhet</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Modal */}
      {showSetupModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Legg til {integrations.find(i => i.id === selectedIntegration)?.name}</CardTitle>
              <CardDescription>
                Konfigurer tilkobling til smarte hjem-systemet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={setupData.name}
                  onChange={(e) => setSetupData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="F.eks. Stue Hue Bridge"
                />
              </div>
              
              {selectedIntegration === 'philips_hue' && (
                <>
                  <div>
                    <Label htmlFor="ip">Bridge IP-adresse</Label>
                    <Input
                      id="ip"
                      value={setupData.ip}
                      onChange={(e) => setSetupData(prev => ({ ...prev, ip: e.target.value }))}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Brukernavn</Label>
                    <Input
                      id="username"
                      value={setupData.username}
                      onChange={(e) => setSetupData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Philips Hue brukernavn"
                    />
                  </div>
                </>
              )}
              
              {selectedIntegration === 'ikea_tradfri' && (
                <>
                  <div>
                    <Label htmlFor="ip">Gateway IP-adresse</Label>
                    <Input
                      id="ip"
                      value={setupData.ip}
                      onChange={(e) => setSetupData(prev => ({ ...prev, ip: e.target.value }))}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="token">Sikkerhetsnøkkel</Label>
                    <Input
                      id="token"
                      value={setupData.token}
                      onChange={(e) => setSetupData(prev => ({ ...prev, token: e.target.value }))}
                      placeholder="Trådfri sikkerhetsnøkkel"
                    />
                  </div>
                </>
              )}
              
              {selectedIntegration === 'amazon_alexa' && (
                <div>
                  <Label htmlFor="token">Access Token</Label>
                  <Input
                    id="token"
                    value={setupData.token}
                    onChange={(e) => setSetupData(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="Amazon Alexa access token"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddIntegration}
                  disabled={!setupData.name || addIntegrationMutation.isLoading}
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
