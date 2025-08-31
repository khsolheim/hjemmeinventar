'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/lib/trpc/client'
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Lightbulb,
  Package,
  MapPin,
  Calendar,
  ShoppingCart,
  Trash2,
  RefreshCw,
  BarChart3,
  Tag
} from 'lucide-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

interface PredictiveMaintenanceProps {
  className?: string
}

export function PredictiveMaintenance({ className = '' }: PredictiveMaintenanceProps) {
  const [activeTab, setActiveTab] = useState('predictions')

  // Fetch predictive data
  const { data: predictiveData, isLoading, refetch } = trpc.ai.predictiveMaintenance.useQuery()

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-3">
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

  if (!predictiveData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Ingen data tilgjengelig</h3>
            <p className="text-sm text-muted-foreground">
              Legg til flere gjenstander og aktiviteter for å få prediktive råd.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { predictions, insights, summary } = predictiveData

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Clock className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utløper snart</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Ting som utløper innen 30 dager
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lav beholdning</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Ting som går tom snart
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organiseringstips</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.organizationTips}</div>
            <p className="text-xs text-muted-foreground">
              AI-genererte råd
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predictions">Prediksjoner</TabsTrigger>
          <TabsTrigger value="insights">Organiseringsråd</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          {predictions.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Ingen prediksjoner</h3>
                  <p className="text-sm text-muted-foreground">
                    Alt ser bra ut! Ingen ting utløper eller går tom snart.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {predictions.map((prediction: any) => (
                <Card key={`${prediction.type}-${prediction.itemId}`} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getUrgencyIcon(prediction.urgency)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{prediction.itemName}</h3>
                            <Badge variant={getUrgencyColor(prediction.urgency) as any}>
                              {prediction.urgency === 'high' ? 'Høy' :
                               prediction.urgency === 'medium' ? 'Medium' : 'Lav'}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {prediction.action}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {prediction.category && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {prediction.category}
                              </span>
                            )}
                            {prediction.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {prediction.location}
                              </span>
                            )}
                            {prediction.type === 'expiry' && prediction.daysUntilExpiry && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {prediction.daysUntilExpiry} dager
                              </span>
                            )}
                            {prediction.type === 'low_stock' && prediction.daysUntilEmpty && (
                              <span className="flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                {prediction.daysUntilEmpty} dager
                              </span>
                            )}
                          </div>

                          {prediction.type === 'low_stock' && prediction.usageRate && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Forbruk: {prediction.usageRate} per måned</span>
                                <span>{prediction.currentQuantity} igjen</span>
                              </div>
                              <Progress
                                value={Math.max(0, (prediction.daysUntilEmpty / 30) * 100)}
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        {prediction.type === 'low_stock' && (
                          <Button size="sm" variant="outline" className="gap-1">
                            <ShoppingCart className="w-3 h-3" />
                            Kjøp
                          </Button>
                        )}
                        {prediction.type === 'expiry' && (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Trash2 className="w-3 h-3" />
                            Sjekk
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Ingen råd tilgjengelig</h3>
                  <p className="text-sm text-muted-foreground">
                    Legg til flere ting og aktiviteter for å få personlige råd.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight: string, index: number) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{insight}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Oppdater råd</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Disse rådene oppdateres basert på din bruk og nye ting du legger til.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetch()}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Generer nye råd
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Smart categorization component
export function SmartCategorization({
  itemName,
  itemDescription,
  onCategorySelect,
  className = ''
}: {
  itemName: string
  itemDescription?: string
  onCategorySelect?: (category: any) => void
  className?: string
}) {
  const { data: result, isPending } = trpc.ai.smartCategorization.useMutation()

  const handleGetSuggestions = () => {
    if (itemName.trim()) {
      result.mutateAsync({
        itemName,
        itemDescription
      })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Button
        onClick={handleGetSuggestions}
        disabled={!itemName.trim() || isPending}
        className="w-full gap-2"
      >
        {isPending ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Lightbulb className="w-4 h-4" />
        )}
        Få smarte kategoriforslag
      </Button>

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">AI-forslag</h4>
                <Badge variant="secondary" className="text-xs">
                  {Math.round((result.category?.confidence || 0) * 100)}% sikker
                </Badge>
              </div>

              {result.category && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-800">
                    Anbefalt kategori: <strong>{result.category.name}</strong>
                  </p>
                  <p className="text-xs text-green-700">
                    {result.category.reasoning}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => onCategorySelect?.(result.category)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Bruk denne kategorien
                  </Button>
                </div>
              )}

              {result.alternativeCategories && result.alternativeCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-green-800">Alternativer:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.alternativeCategories.slice(0, 3).map((cat: any) => (
                      <Button
                        key={cat.id}
                        size="sm"
                        variant="outline"
                        onClick={() => onCategorySelect?.(cat)}
                        className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestedTags && result.suggestedTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-green-800">Foreslåtte tagger:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.suggestedTags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
