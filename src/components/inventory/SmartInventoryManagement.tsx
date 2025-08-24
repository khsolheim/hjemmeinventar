'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShoppingCart,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Zap
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface SmartInventoryManagementProps {
  className?: string
}

export function SmartInventoryManagement({ className }: SmartInventoryManagementProps) {
  const [autoRestockEnabled, setAutoRestockEnabled] = useState(true)
  const [lowStockThreshold, setLowStockThreshold] = useState(3)
  const haptic = useHapticFeedback()

  // Inventory queries
  const lowStockItemsQuery = trpc.inventory.getLowStockItems.useQuery()
  const expiringItemsQuery = trpc.inventory.getExpiringItems.useQuery()
  const stockPredictionsQuery = trpc.inventory.getStockPredictions.useQuery()
  const shoppingListQuery = trpc.inventory.getShoppingList.useQuery()

  const updateStockMutation = trpc.inventory.updateStock.useMutation()
  const generateShoppingListMutation = trpc.inventory.generateShoppingList.useMutation()

  const handleRestockItem = async (itemId: string, quantity: number) => {
    haptic.success()
    try {
      await updateStockMutation.mutateAsync({
        itemId,
        quantity,
        action: 'restock'
      })
    } catch (error) {
      console.error('Failed to restock item:', error)
    }
  }

  const handleGenerateShoppingList = async () => {
    haptic.light()
    try {
      await generateShoppingListMutation.mutateAsync({
        includeLowStock: true,
        includeExpiring: true
      })
    } catch (error) {
      console.error('Failed to generate shopping list:', error)
    }
  }

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { status: 'out', color: 'destructive', text: 'Tom' }
    if (quantity <= threshold) return { status: 'low', color: 'secondary', text: 'Lav' }
    return { status: 'good', color: 'default', text: 'OK' }
  }

  const getExpiryStatus = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) return { status: 'expired', color: 'destructive', text: 'Utløpt' }
    if (daysUntilExpiry <= 3) return { status: 'urgent', color: 'destructive', text: 'Kritisk' }
    if (daysUntilExpiry <= 7) return { status: 'warning', color: 'secondary', text: 'Advarsel' }
    return { status: 'good', color: 'default', text: 'OK' }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Inventarstyring</h2>
          <p className="text-muted-foreground">
            Automatisk lagerstyring og smarte påminnelser
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerateShoppingList}
            disabled={generateShoppingListMutation.isLoading}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Generer handleliste
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lavt lager</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockItemsQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Gjenstander som trenger påfyll
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utløper snart</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {expiringItemsQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Gjenstander som utløper
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forventet bruk</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stockPredictionsQuery.data?.predictedUsage || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Denne uken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Handleliste</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {shoppingListQuery.data?.items?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Gjenstander å kjøpe
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Lavt lager
            </CardTitle>
            <CardDescription>
              Gjenstander som trenger påfyll snart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItemsQuery.data && lowStockItemsQuery.data.length > 0 ? (
                lowStockItemsQuery.data.map((item) => {
                  const stockStatus = getStockStatus(item.availableQuantity, lowStockThreshold)
                  const stockPercentage = (item.availableQuantity / item.totalQuantity) * 100

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                          <Badge variant={stockStatus.color as any} className="text-xs">
                            {stockStatus.text}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Lager: {item.availableQuantity}/{item.totalQuantity}</span>
                          <span>Lokasjon: {item.location?.name}</span>
                        </div>
                        <Progress value={stockPercentage} className="mt-2 h-2" />
                      </div>
                      <Button
                        onClick={() => handleRestockItem(item.id, 5)}
                        size="sm"
                        variant="outline"
                      >
                        Påfyll
                      </Button>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <p>Alt lager er i orden!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              Utløper snart
            </CardTitle>
            <CardDescription>
              Gjenstander som utløper innen 7 dager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringItemsQuery.data && expiringItemsQuery.data.length > 0 ? (
                expiringItemsQuery.data.map((item) => {
                  const expiryStatus = getExpiryStatus(item.daysUntilExpiry)

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                          <Badge variant={expiryStatus.color as any} className="text-xs">
                            {expiryStatus.text}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Utløper: {item.expiryDate}</span>
                          <span>Lager: {item.availableQuantity}</span>
                        </div>
                        {item.daysUntilExpiry <= 3 && (
                          <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Bruk snart eller kast
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {item.daysUntilExpiry} dager
                        </div>
                        <div className="text-xs text-muted-foreground">
                          igjen
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <p>Ingen gjenstander utløper snart!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Predictions */}
      {stockPredictionsQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Lagerprediksjoner
            </CardTitle>
            <CardDescription>
              Forventet bruk basert på historiske data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stockPredictionsQuery.data.predictedUsage}
                </div>
                <div className="text-sm text-muted-foreground">
                  Forventet bruk denne uken
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stockPredictionsQuery.data.itemsToRestock}
                </div>
                <div className="text-sm text-muted-foreground">
                  Gjenstander som trenger påfyll
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stockPredictionsQuery.data.estimatedCost}
                </div>
                <div className="text-sm text-muted-foreground">
                  Estimert kostnad (kr)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Shopping List */}
      {shoppingListQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Smart handleliste
            </CardTitle>
            <CardDescription>
              Automatisk generert basert på lager og bruksmønster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shoppingListQuery.data.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Anbefalt: {item.recommendedQuantity} stk
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {item.estimatedPrice} kr
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.priority === 'high' ? 'Høy prioritet' : 'Normal prioritet'}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-lg font-medium">Total estimert kostnad:</div>
                <div className="text-2xl font-bold text-primary">
                  {shoppingListQuery.data.totalEstimatedCost} kr
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Smart tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Automatisk påfyll</div>
                <div className="text-sm text-blue-700">
                  Systemet varsler automatisk når lageret er lavt
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900">Smart handleliste</div>
                <div className="text-sm text-green-700">
                  Genererer handleliste basert på bruksmønster
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium text-orange-900">Utløpsvarsler</div>
                <div className="text-sm text-orange-700">
                  Får varsler når gjenstander utløper snart
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-medium text-purple-900">Bruksprediksjoner</div>
                <div className="text-sm text-purple-700">
                  Forutser fremtidig bruk basert på historikk
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
