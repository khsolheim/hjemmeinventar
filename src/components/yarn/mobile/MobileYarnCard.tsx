'use client'

import { ChevronRight, Package, Palette, DollarSign, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MobileYarnCardProps {
  master: any
  onClick: () => void
}

export function MobileYarnCard({ master, onClick }: MobileYarnCardProps) {
  const masterData = master.categoryData || {}
  const totals = master.totals || {}
  
  // Determine stock level
  const stockLevel = totals.totalAvailableQuantity <= 1 ? 'critical' : 
                     totals.totalAvailableQuantity <= 2 ? 'low' : 'normal'

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 active:scale-95 hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-base leading-tight">
                  {master.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {masterData.producer || 'Ukjent produsent'}
                </p>
              </div>
              
              {stockLevel !== 'normal' && (
                <div className="ml-2">
                  <Badge 
                    variant={stockLevel === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {stockLevel === 'critical' ? (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    ) : null}
                    {stockLevel === 'critical' ? 'Tom' : 'Lav'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                <span>{totals.totalQuantity || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                <span>{(totals.uniqueColors || []).length}</span>
              </div>
              
              {totals.totalValue > 0 && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{totals.totalValue.toFixed(0)}kr</span>
                </div>
              )}
            </div>

            {/* Composition */}
            {masterData.composition && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {masterData.composition}
                </Badge>
              </div>
            )}

            {/* Colors Preview */}
            {totals?.uniqueColors && totals.uniqueColors.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Farger:</span>
                <div className="flex gap-1">
                  {(totals.uniqueColors || []).slice(0, 4).map((color: string, index: number) => (
                    <div
                      key={index}
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.toLowerCase().includes('#') ? color : '#9CA3AF' }}
                      title={color}
                    />
                  ))}
                  {(totals.uniqueColors?.length || 0) > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{(totals.uniqueColors?.length || 0) - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
        </div>
      </CardContent>
    </Card>
  )
}
