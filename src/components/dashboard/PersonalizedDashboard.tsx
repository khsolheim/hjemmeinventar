'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Sparkles,
  MapPin,
  Package,
  Plus,
  ArrowRight,
  Star,
  Activity
} from 'lucide-react'
import { QuickAddModal } from '@/components/ui/quick-add-modal'

interface PersonalizedDashboardProps {
  className?: string
}

export function PersonalizedDashboard({ className = '' }: PersonalizedDashboardProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string>()

  // Fetch personalized data
  const { data: personalizedData, isLoading } = trpc.ai.getPersonalizedDashboard.useQuery()

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!personalizedData) {
    return null
  }

  const {
    topCategories,
    recentLocations,
    suggestedActions,
    insights,
    quickStats,
    mostActiveHour,
    totalItems,
    totalLocations
  } = personalizedData

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Header with Personalization */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          Velkommen tilbake! 👋
        </h2>
        <p className="text-muted-foreground">
          {totalItems > 0
            ? `Du har ${totalItems} ting registrert på ${totalLocations} steder`
            : 'La oss komme i gang med å registrere dine ting'
          }
        </p>
      </div>

      {/* Quick Actions - Personalized */}
      {suggestedActions && suggestedActions.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Smarte forslag for deg
            </CardTitle>
            <CardDescription>
              Basert på din aktivitet og preferanser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {suggestedActions.map((action: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white/60 rounded-lg border border-blue-100 hover:bg-white/80 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (action.type === 'location_focus' && recentLocations?.[0]) {
                      setSelectedLocationId(recentLocations[0].locationId)
                      setShowQuickAdd(true)
                    } else if (action.type === 'category_focus' && topCategories?.[0]) {
                      setShowQuickAdd(true)
                    } else if (action.action === 'Legg til garn') {
                      setShowQuickAdd(true)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 group-hover:text-blue-700">
                        <span>{action.action}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Most Used Category */}
        {quickStats?.mostUsedCategory && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorittkategori</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quickStats.mostUsedCategory}</div>
              <p className="text-xs text-muted-foreground">
                Mest brukt nylig
              </p>
            </CardContent>
          </Card>
        )}

        {/* Most Active Location */}
        {quickStats?.mostActiveLocation && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktiv plass</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quickStats.mostActiveLocation}</div>
              <p className="text-xs text-muted-foreground">
                Flest ting lagt til
              </p>
            </CardContent>
          </Card>
        )}

        {/* Items This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denne uken</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats?.itemsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nye ting registrert
            </p>
          </CardContent>
        </Card>

        {/* Activity Time */}
        {mostActiveHour && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktiv tid</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mostActiveHour}:00
              </div>
              <p className="text-xs text-muted-foreground">
                Mest aktivt tidspunkt
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Categories & Locations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Categories */}
        {topCategories && topCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Dine toppkategorier
              </CardTitle>
              <CardDescription>
                Kategorier du bruker mest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCategories.slice(0, 3).map((category: any, index: number) => (
                  <div key={category.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.count} ting
                        </div>
                      </div>
                    </div>
                    <Progress value={(category.count / topCategories[0].count) * 100} className="w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Locations */}
        {recentLocations && recentLocations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Aktive steder
              </CardTitle>
              <CardDescription>
                Steder du har vært mest aktiv på
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLocations.map((location: any, index: number) => (
                  <div key={location.locationId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {location.count} ting nylig
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLocationId(location.locationId)
                        setShowQuickAdd(true)
                      }}
                    >
                      Legg til
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Smarte innsikter
            </CardTitle>
            <CardDescription>
              AI-genererte råd basert på din bruk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight: string, index: number) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-blue-900">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        defaultLocationId={selectedLocationId}
      />
    </div>
  )
}

// Compact personalized widget for sidebar or header
export function PersonalizedWidget({ className = '' }: { className?: string }) {
  const { data: personalizedData } = trpc.ai.getPersonalizedDashboard.useQuery()

  if (!personalizedData?.suggestedActions?.length) {
    return null
  }

  const topAction = personalizedData.suggestedActions[0]

  return (
    <div className={`p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{topAction.icon}</span>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{topAction.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{topAction.description}</p>
        </div>
      </div>
    </div>
  )
}
