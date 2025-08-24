'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Settings,
  Layout,
  Clock,
  TrendingUp,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Calendar,
  MapPin,
  Package
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface DashboardPersonalizationProps {
  onLayoutChange?: (layout: string) => void
  onWidgetToggle?: (widget: string, enabled: boolean) => void
}

export function DashboardPersonalization({ 
  onLayoutChange, 
  onWidgetToggle 
}: DashboardPersonalizationProps) {
  const [userPreferences, setUserPreferences] = useState({
    layout: 'grid',
    showQuickActions: true,
    showRecentItems: true,
    showPopularItems: true,
    showUpcomingTasks: true,
    showWeather: false,
    showAnalytics: true,
    showSuggestions: true
  })
  const [isCustomizing, setIsCustomizing] = useState(false)
  const haptic = useHapticFeedback()

  // Fetch user preferences and usage data
  const preferencesQuery = trpc.users.getPreferences.useQuery()
  const usageStatsQuery = trpc.analytics.getUsageStats.useQuery()
  const suggestionsQuery = trpc.ai.getSuggestions.useQuery()

  const updatePreferencesMutation = trpc.users.updatePreferences.useMutation()

  useEffect(() => {
    if (preferencesQuery.data) {
      setUserPreferences(prev => ({
        ...prev,
        ...preferencesQuery.data.dashboard
      }))
    }
  }, [preferencesQuery.data])

  const handleLayoutChange = (layout: string) => {
    haptic.selection()
    setUserPreferences(prev => ({ ...prev, layout }))
    if (onLayoutChange) {
      onLayoutChange(layout)
    }
  }

  const handleWidgetToggle = async (widget: string, enabled: boolean) => {
    haptic.light()
    setUserPreferences(prev => ({ ...prev, [widget]: enabled }))
    
    if (onWidgetToggle) {
      onWidgetToggle(widget, enabled)
    }

    // Save to backend
    try {
      await updatePreferencesMutation.mutateAsync({
        dashboard: {
          ...userPreferences,
          [widget]: enabled
        }
      })
    } catch (error) {
      console.error('Failed to update preferences:', error)
    }
  }

  const layouts = [
    {
      id: 'grid',
      name: 'Grid Layout',
      description: 'Standard grid-visning',
      icon: Layout
    },
    {
      id: 'list',
      name: 'Liste Layout',
      description: 'Kompakt liste-visning',
      icon: Package
    },
    {
      id: 'compact',
      name: 'Kompakt Layout',
      description: 'Minimalistisk visning',
      icon: Eye
    }
  ]

  const widgets = [
    {
      id: 'showQuickActions',
      name: 'Raske handlinger',
      description: 'Vis floating action buttons',
      icon: Sparkles,
      enabled: userPreferences.showQuickActions
    },
    {
      id: 'showRecentItems',
      name: 'Nylige gjenstander',
      description: 'Vis sist brukte gjenstander',
      icon: Clock,
      enabled: userPreferences.showRecentItems
    },
    {
      id: 'showPopularItems',
      name: 'Populære gjenstander',
      description: 'Vis ofte brukte gjenstander',
      icon: TrendingUp,
      enabled: userPreferences.showPopularItems
    },
    {
      id: 'showUpcomingTasks',
      name: 'Kommende oppgaver',
      description: 'Vis vedlikehold og oppgaver',
      icon: Calendar,
      enabled: userPreferences.showUpcomingTasks
    },
    {
      id: 'showAnalytics',
      name: 'Analytikk',
      description: 'Vis bruksstatistikk',
      icon: TrendingUp,
      enabled: userPreferences.showAnalytics
    },
    {
      id: 'showSuggestions',
      name: 'Smart forslag',
      description: 'Vis AI-drevne forslag',
      icon: Star,
      enabled: userPreferences.showSuggestions
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Tilpasning</h2>
          <p className="text-muted-foreground">
            Tilpass dashboardet til dine behov og preferanser
          </p>
        </div>
        <Button
          onClick={() => setIsCustomizing(!isCustomizing)}
          variant={isCustomizing ? "default" : "outline"}
        >
          <Settings className="w-4 h-4 mr-2" />
          {isCustomizing ? 'Avslutt' : 'Tilpass'}
        </Button>
      </div>

      {/* Layout Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Layout
          </CardTitle>
          <CardDescription>
            Velg hvordan dashboardet skal vises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <div
                key={layout.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  userPreferences.layout === layout.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => handleLayoutChange(layout.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <layout.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{layout.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {layout.description}
                    </div>
                  </div>
                </div>
                {userPreferences.layout === layout.id && (
                  <Badge variant="default" className="text-xs">
                    Aktiv
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Widget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Widgets
          </CardTitle>
          <CardDescription>
            Aktiver eller deaktiver dashboard-widgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <widget.icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{widget.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {widget.description}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={widget.enabled}
                  onCheckedChange={(enabled) => handleWidgetToggle(widget.id, enabled)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {usageStatsQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Bruksstatistikk
            </CardTitle>
            <CardDescription>
              Hvordan du bruker systemet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {usageStatsQuery.data.totalItems}
                </div>
                <div className="text-sm text-muted-foreground">
                  Gjenstander
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {usageStatsQuery.data.totalLocations}
                </div>
                <div className="text-sm text-muted-foreground">
                  Lokasjoner
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {usageStatsQuery.data.weeklyActivity}
                </div>
                <div className="text-sm text-muted-foreground">
                  Aktiviteter denne uken
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {usageStatsQuery.data.favoriteLocation}
                </div>
                <div className="text-sm text-muted-foreground">
                  Favorittlokasjon
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Suggestions */}
      {suggestionsQuery.data && userPreferences.showSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Smart forslag
            </CardTitle>
            <CardDescription>
              Basert på din bruksmønster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestionsQuery.data.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <suggestion.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    {suggestion.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {userPreferences.showQuickActions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Raske handlinger
            </CardTitle>
            <CardDescription>
              Ofte brukte funksjoner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Package className="w-5 h-5" />
                <span className="text-sm">Legg til gjenstand</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Opprett lokasjon</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Planlegg oppgave</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <RefreshCw className="w-5 h-5" />
                <span className="text-sm">Oppdater inventar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
