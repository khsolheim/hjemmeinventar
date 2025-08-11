'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package, DollarSign, Calendar, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc/client'

interface MobileBatchViewProps {
  masterId: string
}

export function MobileBatchView({ masterId }: MobileBatchViewProps) {
  const [selectedBatch, setSelectedBatch] = useState<any>(null)

  // Fetch batches for this master
  const { data: batches, isLoading } = trpc.yarn.getBatchesForMaster.useQuery({
    masterId
  })

  // Fetch master details
  const { data: master } = trpc.items.getById.useQuery({
    id: masterId
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const masterData = master?.categoryData ? JSON.parse(master.categoryData) : {}

  return (
    <div className="space-y-4">
      {/* Master Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Garn-info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {masterData.producer && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Produsent:</span>
              <span className="font-medium">{masterData.producer}</span>
            </div>
          )}
          
          {masterData.composition && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fiber:</span>
              <span className="font-medium">{masterData.composition}</span>
            </div>
          )}
          
          {masterData.needleSize && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pinner:</span>
              <span className="font-medium">{masterData.needleSize}</span>
            </div>
          )}
          
          {masterData.weight && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vekt:</span>
              <span className="font-medium">{masterData.weight}</span>
            </div>
          )}
          
          {masterData.yardage && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Løpelengde:</span>
              <span className="font-medium">{masterData.yardage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Batches ({batches?.length || 0})</h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ny Batch
          </Button>
        </div>

        {!batches || batches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <h4 className="font-medium mb-2">Ingen batches</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Legg til første batch for dette garnet
              </p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Legg til Batch
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => {
              const batchData = batch.categoryData ? JSON.parse(batch.categoryData) : {}
              return (
                <Card key={batch.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ 
                              backgroundColor: batchData.colorCode || '#9CA3AF' 
                            }}
                          />
                          <span className="font-medium">{batchData.color || 'Ukjent farge'}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Batch: {batchData.batchNumber || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{batch.availableQuantity} {batch.unit}</div>
                        <div className="text-xs text-muted-foreground">
                          av {batch.totalQuantity} totalt
                        </div>
                      </div>
                    </div>

                    {/* Batch Details */}
                    <div className="space-y-2 text-sm">
                      {batchData.pricePerSkein && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>{batchData.pricePerSkein} kr/nøste</span>
                        </div>
                      )}
                      
                      {batchData.purchaseDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(batchData.purchaseDate).toLocaleDateString('no-NO')}</span>
                        </div>
                      )}
                      
                      {batchData.condition && (
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {batchData.condition}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
