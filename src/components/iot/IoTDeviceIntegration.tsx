'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  Wifi,
  Bluetooth,
  Smartphone,
  Watch,
  Activity,
  Thermometer,
  Droplets,
  Sun,
  Moon,
  Zap,
  Shield,
  Settings,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Signal,
  Battery,
  WifiOff,
  BluetoothOff,
  Smartphone as Phone,
  Watch as Smartwatch,
  Activity as Fitness,
  Thermometer as Temp,
  Droplets as Humidity,
  Sun as Light,
  Moon as Dark,
  Zap as Energy,
  Shield as Security
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface IoTDeviceIntegrationProps {
  className?: string
}

export function IoTDeviceIntegration({ className }: IoTDeviceIntegrationProps) {
  const [selectedTab, setSelectedTab] = useState<'devices' | 'sensors' | 'wearables' | 'automation'>('devices')
  const [showAddModal, setShowAddModal] = useState(false)
  const haptic = useHapticFeedback()

  // IoT queries
  const devicesQuery = trpc.iot.getDevices.useQuery()
  const sensorsQuery = trpc.iot.getSensors.useQuery()
  const wearablesQuery = trpc.iot.getWearables.useQuery()
  const automationQuery = trpc.iot.getAutomations.useQuery()

  const addDeviceMutation = trpc.iot.addDevice.useMutation()
  const toggleDeviceMutation = trpc.iot.toggleDevice.useMutation()
  const updateSensorMutation = trpc.iot.updateSensor.useMutation()

  const handleAddDevice = async (device: any) => {
    haptic.success()
    try {
      await addDeviceMutation.mutateAsync(device)
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to add device:', error)
    }
  }

  const handleToggleDevice = async (deviceId: string, enabled: boolean) => {
    haptic.light()
    try {
      await toggleDeviceMutation.mutateAsync({ deviceId, enabled })
    } catch (error) {
      console.error('Failed to toggle device:', error)
    }
  }

  const handleUpdateSensor = async (sensorId: string, data: any) => {
    haptic.selection()
    try {
      await updateSensorMutation.mutateAsync({ sensorId, data })
    } catch (error) {
      console.error('Failed to update sensor:', error)
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return Phone
      case 'smartwatch': return Smartwatch
      case 'fitness_tracker': return Fitness
      case 'temperature_sensor': return Temp
      case 'humidity_sensor': return Humidity
      case 'light_sensor': return Light
      case 'motion_sensor': return Activity
      case 'energy_monitor': return Energy
      case 'security_camera': return Security
      default: return Wifi
    }
  }

  const getDeviceStatus = (status: string) => {
    switch (status) {
      case 'online': return { label: 'Online', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'offline': return { label: 'Offline', color: 'bg-red-100 text-red-800', icon: XCircle }
      case 'error': return { label: 'Feil', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
      case 'connecting': return { label: 'Kobler til', color: 'bg-blue-100 text-blue-800', icon: RefreshCw }
      default: return { label: 'Ukjent', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }
  }

  const getConnectionType = (type: string) => {
    switch (type) {
      case 'wifi': return { icon: Wifi, color: 'text-blue-600' }
      case 'bluetooth': return { icon: Bluetooth, color: 'text-purple-600' }
      case 'zigbee': return { icon: Signal, color: 'text-green-600' }
      case 'z-wave': return { icon: Signal, color: 'text-orange-600' }
      default: return { icon: Wifi, color: 'text-gray-600' }
    }
  }

  const getBatteryStatus = (level: number) => {
    if (level > 80) return { color: 'text-green-600', icon: Battery }
    if (level > 40) return { color: 'text-yellow-600', icon: Battery }
    return { color: 'text-red-600', icon: Battery }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IoT Device Integration</h2>
          <p className="text-muted-foreground">
            Koble til smarte enheter og sensorer
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Legg til enhet
        </Button>
      </div>

      {/* IoT Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tilkoblede enheter</CardTitle>
            <Wifi className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {devicesQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktive enheter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensorer</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sensorsQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktive sensorer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wearables</CardTitle>
            <Watch className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {wearablesQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tilkoblede wearables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automatiseringer</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {automationQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              IoT automatiseringer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'devices' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('devices')}
          className="flex-1"
        >
          <Wifi className="w-4 h-4 mr-2" />
          Enheter
        </Button>
        <Button
          variant={selectedTab === 'sensors' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('sensors')}
          className="flex-1"
        >
          <Activity className="w-4 h-4 mr-2" />
          Sensorer
        </Button>
        <Button
          variant={selectedTab === 'wearables' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('wearables')}
          className="flex-1"
        >
          <Watch className="w-4 h-4 mr-2" />
          Wearables
        </Button>
        <Button
          variant={selectedTab === 'automation' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('automation')}
          className="flex-1"
        >
          <Zap className="w-4 h-4 mr-2" />
          Automatisering
        </Button>
      </div>

      {/* Devices Tab */}
      {selectedTab === 'devices' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Tilkoblede enheter
              </CardTitle>
              <CardDescription>
                Oversikt over alle IoT-enheter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devicesQuery.data?.map((device) => {
                  const IconComponent = getDeviceIcon(device.type)
                  const status = getDeviceStatus(device.status)
                  const StatusIcon = status.icon
                  const connection = getConnectionType(device.connectionType)
                  const ConnectionIcon = connection.icon
                  
                  return (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {device.type} • {device.location}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <ConnectionIcon className={`w-4 h-4 ${connection.color}`} />
                          <span className="text-sm text-muted-foreground">
                            {device.connectionType}
                          </span>
                        </div>
                        
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        
                        <Switch
                          checked={device.enabled}
                          onCheckedChange={(enabled) => handleToggleDevice(device.id, enabled)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sensors Tab */}
      {selectedTab === 'sensors' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Sensorer og målinger
              </CardTitle>
              <CardDescription>
                Real-time data fra IoT-sensorer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sensorsQuery.data?.map((sensor) => {
                  const IconComponent = getDeviceIcon(sensor.type)
                  const batteryStatus = getBatteryStatus(sensor.batteryLevel)
                  const BatteryIcon = batteryStatus.icon
                  
                  return (
                    <div key={sensor.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">{sensor.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BatteryIcon className={`w-4 h-4 ${batteryStatus.color}`} />
                          <span className="text-sm">{sensor.batteryLevel}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Nåværende verdi</span>
                          <span className="font-medium">{sensor.currentValue} {sensor.unit}</span>
                        </div>
                        
                        {sensor.trend && (
                          <div className="flex justify-between text-sm">
                            <span>Trend</span>
                            <span className={sensor.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                              {sensor.trend === 'up' ? '↗' : '↘'} {sensor.trendValue}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Sist oppdatert: {new Date(sensor.lastUpdate).toLocaleTimeString('no-NO')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wearables Tab */}
      {selectedTab === 'wearables' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="w-5 h-5" />
                Wearables og fitness
              </CardTitle>
              <CardDescription>
                Smartklokker og fitness-trackere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wearablesQuery.data?.map((wearable) => {
                  const IconComponent = getDeviceIcon(wearable.type)
                  const status = getDeviceStatus(wearable.status)
                  const StatusIcon = status.icon
                  const batteryStatus = getBatteryStatus(wearable.batteryLevel)
                  const BatteryIcon = batteryStatus.icon
                  
                  return (
                    <div key={wearable.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{wearable.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {wearable.type} • {wearable.brand}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{wearable.steps} steg</div>
                          <div className="text-xs text-muted-foreground">I dag</div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <BatteryIcon className={`w-4 h-4 ${batteryStatus.color}`} />
                          <span className="text-sm">{wearable.batteryLevel}%</span>
                        </div>
                        
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
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

      {/* Automation Tab */}
      {selectedTab === 'automation' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                IoT Automatiseringer
              </CardTitle>
              <CardDescription>
                Automatiske handlinger basert på sensor-data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationQuery.data?.map((automation) => (
                  <div key={automation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-yellow-600" />
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
                      <div className="text-sm text-muted-foreground">
                        {automation.triggerCount} ganger utløst
                      </div>
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
              <Wifi className="w-5 h-5" />
              <span className="text-sm">Søk enheter</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Synkroniser</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Sikkerhet</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Innstillinger</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
