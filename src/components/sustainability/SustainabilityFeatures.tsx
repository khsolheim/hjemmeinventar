'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Leaf,
  Recycle,
  TrendingDown,
  TrendingUp,
  TreePine,
  Lightbulb,
  Car,
  Home,
  Package,
  ShoppingBag,
  Calculator,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Edit,
  Download
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface SustainabilityFeaturesProps {
  className?: string
}

export function SustainabilityFeatures({ className }: SustainabilityFeaturesProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'impact' | 'waste' | 'tips'>('overview')
  const haptic = useHapticFeedback()

  // Sustainability queries
  const impactQuery = trpc.sustainability.getEnvironmentalImpact.useQuery()
  const wasteQuery = trpc.sustainability.getWasteReduction.useQuery()
  const tipsQuery = trpc.sustainability.getGreenTips.useQuery()
  const goalsQuery = trpc.sustainability.getSustainabilityGoals.useQuery()

  const addWasteEntryMutation = trpc.sustainability.addWasteEntry.useMutation()
  const updateGoalMutation = trpc.sustainability.updateGoal.useMutation()

  const handleAddWasteEntry = async (entry: any) => {
    haptic.success()
    try {
      await addWasteEntryMutation.mutateAsync(entry)
    } catch (error) {
      console.error('Failed to add waste entry:', error)
    }
  }

  const handleUpdateGoal = async (goalId: string, progress: number) => {
    haptic.light()
    try {
      await updateGoalMutation.mutateAsync({ goalId, progress })
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const getImpactColor = (impact: number) => {
    if (impact < 100) return 'text-green-600'
    if (impact < 200) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWasteStatus = (reduction: number) => {
    if (reduction >= 50) return { status: 'excellent', color: 'bg-green-100 text-green-800', icon: Award }
    if (reduction >= 25) return { status: 'good', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    if (reduction >= 10) return { status: 'fair', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    return { status: 'poor', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  }

  const getTipCategory = (category: string) => {
    switch (category) {
      case 'energy': return { icon: Lightbulb, color: 'text-yellow-600' }
      case 'transport': return { icon: Car, color: 'text-blue-600' }
      case 'waste': return { icon: Recycle, color: 'text-green-600' }
      case 'shopping': return { icon: ShoppingBag, color: 'text-purple-600' }
      default: return { icon: Leaf, color: 'text-green-600' }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bærekraft og Miljø</h2>
          <p className="text-muted-foreground">
            Spor miljøpåvirkning og reduser avfall
          </p>
        </div>
        <Button
          onClick={() => setSelectedTab('impact')}
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          Beregn påvirkning
        </Button>
      </div>

      {/* Sustainability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Karbonavtrykk</CardTitle>
            <TreePine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getImpactColor(impactQuery.data?.carbonFootprint || 0)}`}>
              {impactQuery.data?.carbonFootprint || 0} kg CO2
            </div>
            <p className="text-xs text-muted-foreground">
              Denne måneden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avfall reduksjon</CardTitle>
            <Recycle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {wasteQuery.data?.reductionPercentage || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Fra forrige måned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gjenbrukte gjenstander</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {wasteQuery.data?.reusedItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Denne måneden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mål oppnådd</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {goalsQuery.data?.completedGoals || 0}/{goalsQuery.data?.totalGoals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Bærekraftsmål
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
          <Leaf className="w-4 h-4 mr-2" />
          Oversikt
        </Button>
        <Button
          variant={selectedTab === 'impact' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('impact')}
          className="flex-1"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Påvirkning
        </Button>
        <Button
          variant={selectedTab === 'waste' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('waste')}
          className="flex-1"
        >
          <Recycle className="w-4 h-4 mr-2" />
          Avfall
        </Button>
        <Button
          variant={selectedTab === 'tips' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('tips')}
          className="flex-1"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Tips
        </Button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          {/* Carbon Footprint Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Karbonavtrykk fordeling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {impactQuery.data?.breakdown?.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.impact} kg CO2
                      </span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sustainability Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Bærekraftsmål
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goalsQuery.data?.goals?.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.progress}% fullført
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Impact Tab */}
      {selectedTab === 'impact' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Miljøpåvirkning kalkulator
              </CardTitle>
              <CardDescription>
                Beregn påvirkningen av dine aktiviteter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Transport</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimert: 45 kg CO2/måned
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Husholdning</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimert: 120 kg CO2/måned
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Forbruk</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimert: 85 kg CO2/måned
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Recycle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Avfall</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimert: 30 kg CO2/måned
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Waste Tab */}
      {selectedTab === 'waste' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5" />
                Avfall reduksjon
              </CardTitle>
              <CardDescription>
                Spor avfall og gjenbruk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wasteQuery.data?.categories?.map((category) => {
                  const status = getWasteStatus(category.reduction)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Recycle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {category.currentAmount} kg denne måneden
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {category.reduction}% reduksjon
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

      {/* Tips Tab */}
      {selectedTab === 'tips' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Grønne tips
              </CardTitle>
              <CardDescription>
                Få tips for å leve mer bærekraftig
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tipsQuery.data?.map((tip) => {
                  const category = getTipCategory(tip.category)
                  const CategoryIcon = category.icon
                  
                  return (
                    <div key={tip.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <CategoryIcon className={`w-4 h-4 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{tip.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {tip.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {tip.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Sparer {tip.savings} kg CO2
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Raske handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Calculator className="w-5 h-5" />
              <span className="text-sm">Beregn påvirkning</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Recycle className="w-5 h-5" />
              <span className="text-sm">Registrer avfall</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">Sett mål</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Eksporter rapport</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
