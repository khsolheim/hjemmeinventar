"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  BookOpen,
  Wrench,
  Package
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

export function AIInsightsDashboard({ aiEnabled }: { aiEnabled: boolean }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<'overview' | 'optimization' | 'predictions' | 'maintenance'>('overview')

  const aiStatus = { enabled: aiEnabled }
  
  // Stabiliser visning: vent litt før vi viser dynamiske data for å unngå CLS
  const [stabilized, setStabilized] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setStabilized(true), 3000)
    return () => clearTimeout(id)
  }, [])
  
  // Get AI insights
  const { 
    data: insights, 
    isLoading: insightsLoading, 
    refetch: refetchInsights 
  } = trpc.ai.generateInsights.useQuery(undefined, {
    enabled: aiStatus?.enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Get inventory analysis
  const { 
    data: analysis, 
    isLoading: analysisLoading, 
    refetch: refetchAnalysis 
  } = trpc.ai.analyzeInventory.useQuery(
    { analysisType: selectedAnalysis },
    {
      enabled: aiStatus?.enabled,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const refreshAllInsights = () => {
    refetchInsights()
    refetchAnalysis()
    toast.success('AI-innsikter oppdateres...')
  }

  if (!aiStatus?.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-gray-400" />
            AI-Innsikter (Ikke tilgjengelig)
          </CardTitle>
          <CardDescription>
            AI-funksjoner er ikke aktivert. Sett OPENAI_API_KEY for å aktivere intelligente analyser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              For å aktivere AI-innsikter, legg til din OpenAI API-nøkkel i miljøvariablene.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 min-h-[680px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI-Innsikter
          </h2>
          <p className="text-muted-foreground">
            Intelligente analyser og anbefalinger for ditt inventar
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshAllInsights}
          disabled={insightsLoading || analysisLoading}
        >
          {insightsLoading || analysisLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Oppdater
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '420px' }}>
        {/* Quick Insights */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Smarte Tips
              </CardTitle>
              <CardDescription>
                Personaliserte anbefalinger
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[140px]">
              {insightsLoading || !stabilized ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                  <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
                </div>
              ) : insights && insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Ingen innsikter tilgjengelig ennå.</p>
                  <p className="text-xs mt-1">
                    Legg til flere gjenstander for bedre analyser.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Detaljert Analyse
              </CardTitle>
              <CardDescription>
                Dyptgående inventaranalyse med AI
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[420px]">
              <Tabs value={selectedAnalysis} onValueChange={(value: any) => setSelectedAnalysis(value)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    Oversikt
                  </TabsTrigger>
                  <TabsTrigger value="optimization" className="text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    Optimalisering
                  </TabsTrigger>
                  <TabsTrigger value="predictions" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Prediksjoner
                  </TabsTrigger>
                  <TabsTrigger value="maintenance" className="text-xs">
                    <Wrench className="w-3 h-3 mr-1" />
                    Vedlikehold
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  {analysisLoading || !stabilized ? (
                    <div className="space-y-4">
                      <div className="h-6 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-muted animate-pulse rounded" />
                        <div className="h-20 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-4">
                      {/* Analysis Text */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          AI-Analyse
                        </h4>
                        <p className="text-sm text-gray-700">{analysis.analysis}</p>
                      </div>

                      {/* Metrics Grid */}
                      {analysis.metrics && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-white rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">Totalt</span>
                            </div>
                            <p className="text-xl font-bold">{analysis?.metrics && 'totalItems' in analysis.metrics ? analysis.metrics.totalItems : 0}</p>
                            <p className="text-xs text-muted-foreground">gjenstander</p>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <PieChart className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">Kategorier</span>
                            </div>
                            <p className="text-xl font-bold">{analysis?.metrics && 'categoriesUsed' in analysis.metrics ? analysis.metrics.categoriesUsed : 0}</p>
                            <p className="text-xs text-muted-foreground">i bruk</p>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium">Aktivitet</span>
                            </div>
                            <p className="text-xl font-bold">{analysis?.metrics && 'recentActivityCount' in analysis.metrics ? analysis.metrics.recentActivityCount : 0}</p>
                            <p className="text-xs text-muted-foreground">siste uke</p>
                          </div>

                          {analysis?.metrics && 'itemsWithoutLocation' in analysis.metrics && analysis.metrics.itemsWithoutLocation > 0 && (
                            <div className="p-3 bg-white rounded-lg border border-orange-200">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium">Mangler lokasjon</span>
                              </div>
                              <p className="text-xl font-bold">{analysis?.metrics && 'itemsWithoutLocation' in analysis.metrics ? analysis.metrics.itemsWithoutLocation : 0}</p>
                              <p className="text-xs text-muted-foreground">gjenstander</p>
                            </div>
                          )}

                          {analysis?.metrics && 'expiringItems' in analysis.metrics && analysis?.metrics && 'expiringItems' in analysis.metrics ? analysis.metrics.expiringItems : 0 > 0 && (
                            <div className="p-3 bg-white rounded-lg border border-red-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium">Utløper snart</span>
                              </div>
                              <p className="text-xl font-bold">{analysis?.metrics && 'expiringItems' in analysis.metrics ? analysis.metrics.expiringItems : 0}</p>
                              <p className="text-xs text-muted-foreground">neste 30 dager</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Suggestions */}
                      {analysis.suggestions && analysis.suggestions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-green-600" />
                            Anbefalinger
                          </h4>
                          <div className="space-y-2">
                            {analysis.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Ingen analysedata tilgjengelig.</p>
                      <p className="text-sm mt-1">Prøv å oppdatere eller legg til flere gjenstander.</p>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-dashed border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-medium mb-1">Smart Kategorisering</h3>
              <p className="text-sm text-muted-foreground mb-3">
                La AI kategorisere dine gjenstander automatisk
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Kom snart
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-green-200 hover:border-green-300 transition-colors">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-medium mb-1">Forbruksprediksjon</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Forutsi når du trenger å fylle på lageret
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Kom snart
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-purple-200 hover:border-purple-300 transition-colors">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-medium mb-1">Optimaliseringsråd</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Få personlige tips for bedre organisering
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Kom snart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

