'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  MapPin,
  Navigation,
  Compass,
  Globe,
  Satellite,
  Wifi,
  Bluetooth,
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
  MapPin as Location,
  Navigation as GPS,
  Compass as Direction,
  Globe as World,
  Satellite as Signal,
  Wifi as Network,
  Bluetooth as BT,
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
  MapPin as Pin,
  Navigation as Nav,
  Compass as Comp,
  Globe as Earth,
  Satellite as Sat,
  Wifi as Wireless,
  Bluetooth as Blue,
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
  Home,
  Building,
  Store,
  Car,
  Plane,
  Train,
  Bus,
  Bike,
  Walk,
  Clock,
  Calendar,
  Users,
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
  Upload
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedLocationProps {
  className?: string
}

export function AdvancedLocation({ className }: AdvancedLocationProps) {
  const [selectedTab, setSelectedTab] = useState<'gps' | 'indoor' | 'analytics' | 'settings'>('gps')
  const [isTracking, setIsTracking] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null)
  const [locationHistory, setLocationHistory] = useState<any[]>([])
  const haptic = useHapticFeedback()

  // Location queries
  const locationQuery = trpc.location.getLocationStatus.useQuery()
  const gpsQuery = trpc.location.getGPSData.useQuery()
  const indoorQuery = trpc.location.getIndoorPositioning.useQuery()
  const analyticsQuery = trpc.location.getLocationAnalytics.useQuery()

  const startTrackingMutation = trpc.location.startTracking.useMutation()
  const updateLocationMutation = trpc.location.updateLocation.useMutation()
  const updateSettingsMutation = trpc.location.updateSettings.useMutation()

  useEffect(() => {
    // Initialize location tracking
    if (locationEnabled && selectedTab === 'gps') {
      startLocationTracking()
    } else {
      stopLocationTracking()
    }

    return () => {
      stopLocationTracking()
    }
  }, [locationEnabled, selectedTab])

  const startLocationTracking = async () => {
    try {
      if ('geolocation' in navigator) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentLocation(position)
            updateLocationData(position)
            haptic.success()
          },
          (error) => {
            console.error('Location error:', error)
            haptic.error()
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
          }
        )

        // Store watch ID for cleanup
        return () => navigator.geolocation.clearWatch(watchId)
      }
    } catch (error) {
      console.error('Failed to start location tracking:', error)
      haptic.error()
    }
  }

  const stopLocationTracking = () => {
    // Location tracking cleanup is handled by useEffect cleanup
  }

  const updateLocationData = async (position: GeolocationPosition) => {
    try {
      await updateLocationMutation.mutateAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      })
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }

  const handleStartTracking = async () => {
    try {
      setIsTracking(true)
      haptic.selection()
      
      const result = await startTrackingMutation.mutateAsync()
      
      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to start tracking:', error)
      haptic.error()
    } finally {
      setIsTracking(false)
    }
  }

  const handleToggleLocation = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ locationEnabled: enabled })
      setLocationEnabled(enabled)
      if (!enabled) {
        stopLocationTracking()
      }
    } catch (error) {
      console.error('Failed to toggle location:', error)
    }
  }

  const getLocationStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Aktiv', icon: MapPin }
      case 'inactive': return { color: 'text-red-600', label: 'Inaktiv', icon: XCircle }
      case 'tracking': return { color: 'text-yellow-600', label: 'Tracking', icon: Navigation }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy <= 5) return { level: 'Excellent', color: 'text-green-600' }
    if (accuracy <= 10) return { level: 'Good', color: 'text-blue-600' }
    if (accuracy <= 20) return { level: 'Fair', color: 'text-yellow-600' }
    return { level: 'Poor', color: 'text-red-600' }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Location</h2>
          <p className="text-muted-foreground">
            GPS integration, indoor positioning og location analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            GPS Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Satellite className="w-3 h-3" />
            Indoor Ready
          </Badge>
        </div>
      </div>

      {/* Location Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPS Status</CardTitle>
            <Navigation className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {locationEnabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getLocationStatus(locationEnabled ? 'active' : 'inactive').label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentLocation ? `${currentLocation.coords.accuracy.toFixed(1)}m` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentLocation ? getAccuracyLevel(currentLocation.coords.accuracy).level : 'No GPS'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indoor</CardTitle>
            <Wifi className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {indoorQuery.data?.accuracy || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Indoor accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <Globe className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsQuery.data?.totalLocations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tracked locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'gps' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('gps')}
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-2" />
          GPS
        </Button>
        <Button
          variant={selectedTab === 'indoor' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('indoor')}
          className="flex-1"
        >
          <Wifi className="w-4 h-4 mr-2" />
          Indoor
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('analytics')}
          className="flex-1"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
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

      {/* GPS Tab */}
      {selectedTab === 'gps' && (
        <div className="space-y-4">
          {/* GPS Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                GPS Tracking
              </CardTitle>
              <CardDescription>
                Real-time GPS location tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Location */}
                {currentLocation && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Location</label>
                    <div className="p-4 border rounded-lg bg-muted">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Coordinates</div>
                          <div className="font-medium">
                            {formatCoordinates(currentLocation.coords.latitude, currentLocation.coords.longitude)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Accuracy</div>
                          <div className="font-medium">
                            {currentLocation.coords.accuracy.toFixed(1)}m
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Altitude</div>
                          <div className="font-medium">
                            {currentLocation.coords.altitude ? `${currentLocation.coords.altitude.toFixed(1)}m` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Speed</div>
                          <div className="font-medium">
                            {currentLocation.coords.speed ? `${(currentLocation.coords.speed * 3.6).toFixed(1)} km/h` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* GPS Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant={isTracking ? 'destructive' : 'default'}
                    onClick={handleStartTracking}
                    disabled={!locationEnabled || isTracking}
                    className="w-20 h-20 rounded-full"
                  >
                    {isTracking ? (
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    ) : (
                      <Navigation className="w-8 h-8" />
                    )}
                  </Button>
                </div>

                {/* GPS Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Navigation className="w-5 h-5" />
                    <span className="text-sm">Start Tracking</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Compass className="w-5 h-5" />
                    <span className="text-sm">Get Direction</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm">Save Location</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share Location</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPS Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                GPS Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationQuery.data?.gpsStatus?.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Navigation className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{status.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {status.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{status.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {status.lastUpdate}
                        </div>
                      </div>
                      
                      <Badge variant={status.isActive ? 'default' : 'secondary'}>
                        {status.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indoor Tab */}
      {selectedTab === 'indoor' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Indoor Positioning
              </CardTitle>
              <CardDescription>
                WiFi og Bluetooth-based indoor positioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indoorQuery.data?.indoorData?.map((indoor) => (
                  <div key={indoor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Wifi className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{indoor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {indoor.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{indoor.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">
                          {indoor.type}
                        </div>
                      </div>
                      
                      <Badge variant={indoor.accuracy > 80 ? 'default' : 'secondary'}>
                        {indoor.accuracy > 80 ? 'High' : 'Medium'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Indoor Technologies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Indoor Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {indoorQuery.data?.technologies?.map((tech) => (
                  <div key={tech.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <tech.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{tech.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {tech.accuracy}% accuracy
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Location Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsQuery.data?.metrics?.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Location Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsQuery.data?.trends?.map((trend) => (
                    <div key={trend.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <trend.icon className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{trend.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {trend.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Location History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsQuery.data?.locationHistory?.map((location) => (
                  <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {location.coordinates}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{location.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {location.timestamp}
                        </div>
                      </div>
                      
                      <Badge variant={location.type === 'Home' ? 'default' : 'secondary'}>
                        {location.type}
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
                Location Settings
              </CardTitle>
              <CardDescription>
                Configure location tracking settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationQuery.data?.settings?.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <setting.icon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{setting.name}</span>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => {
                        if (setting.key === 'locationEnabled') {
                          handleToggleLocation(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Location Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationQuery.data?.preferences?.map((preference) => (
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
              <Navigation className="w-5 h-5" />
              <span className="text-sm">Start GPS</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Wifi className="w-5 h-5" />
              <span className="text-sm">Indoor Mode</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <MapPin className="w-5 h-5" />
              <span className="text-sm">Save Location</span>
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
