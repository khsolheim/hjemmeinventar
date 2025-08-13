'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package, MapPin, Calendar, DollarSign, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { YarnWizard } from './YarnWizard'
import { YarnProjectIntegration } from './YarnProjectIntegration'
import { YarnBulkOperations } from './YarnBulkOperations'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface BatchGridProps {
  masterId: string
  hideMasterHeader?: boolean
}

export function BatchGrid({ masterId, hideMasterHeader = false }: BatchGridProps) {
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false)

  // Fetch master data
  const { data: master, refetch: refetchMaster } = trpc.items.getById.useQuery(masterId)
  
  // Fetch batches for this master
  const { data: batches, isLoading, refetch: refetchBatches } = trpc.yarn.getBatchesForMaster.useQuery({ masterId })
  
  // Fetch master totals
  const { data: totals, refetch: refetchTotals } = trpc.yarn.getMasterTotals.useQuery({ masterId })

  // Delete batch mutation
  const deleteBatchMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      refetchBatches()
      refetchTotals()
      toast.success('Batch slettet')
    },
    onError: (error) => {
      toast.error('Feil ved sletting av batch')
      console.error(error)
    }
  })

  const handleBatchAdded = () => {
    setIsAddBatchOpen(false)
    refetchBatches()
    refetchTotals()
  }

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    try {
      await deleteBatchMutation.mutateAsync(batchId)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const getMasterData = () => {
    if (!master?.categoryData) return {}
    try {
      return JSON.parse(master.categoryData)
    } catch {
      return {}
    }
  }

  const getBatchData = (categoryData: string | null) => {
    if (!categoryData) return {}
    try {
      return JSON.parse(categoryData)
    } catch {
      return {}
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Ikke angitt'
    return new Date(date).toLocaleDateString('nb-NO')
  }

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Ikke angitt'
    return `${price.toFixed(2)} kr`
  }

  const masterData = getMasterData()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Master Information */}
      {master && !hideMasterHeader && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{master.name}</CardTitle>
                <CardDescription>
                  {masterData.producer} • {masterData.composition}
                </CardDescription>
              </div>
              <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Legg til Batch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Legg til ny batch</DialogTitle>
                    <DialogDescription>
                      Registrer en ny batch for {master.name}
                    </DialogDescription>
                  </DialogHeader>
                  <YarnWizard 
                    existingMasterId={masterId} 
                    onComplete={handleBatchAdded} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Vekt</div>
                <div className="font-medium">{masterData.weight || 'Ikke angitt'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Løpelengde</div>
                <div className="font-medium">{masterData.yardage || 'Ikke angitt'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Pinner</div>
                <div className="font-medium">{masterData.needleSize || 'Ikke angitt'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Strikkefasthet</div>
                <div className="font-medium">{masterData.gauge || 'Ikke angitt'}</div>
              </div>
            </div>
            
            {masterData.careInstructions && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Vaskeråd</div>
                <div className="text-sm">{masterData.careInstructions}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{totals.totalSkeins}</div>
                  <div className="text-xs text-muted-foreground">Totalt nøster</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{totals.availableSkeins}</div>
                  <div className="text-xs text-muted-foreground">Tilgjengelig</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{totals.totalValue.toFixed(0)} kr</div>
                  <div className="text-xs text-muted-foreground">Total verdi</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{totals.batchCount}</div>
                  <div className="text-xs text-muted-foreground">Batches</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batches Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Batches</h3>
        
        {!batches || batches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ingen batches ennå</h3>
              <p className="text-muted-foreground text-center mb-4">
                Legg til din første batch for å komme i gang med å spore dette garnet.
              </p>
              <Button onClick={() => setIsAddBatchOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Legg til Batch
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => {
              const batchData = getBatchData(batch.categoryData)
              const colorStyle = batchData.colorCode 
                ? { backgroundColor: batchData.colorCode }
                : undefined

              return (
                <Card key={batch.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={colorStyle}
                            title={batchData.color}
                          />
                          {batchData.color}
                        </CardTitle>
                        <CardDescription>
                          Batch: {batchData.batchNumber}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Slett batch?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Er du sikker på at du vil slette batch "{batchData.color} - {batchData.batchNumber}"? 
                                Denne handlingen kan ikke angres.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Avbryt</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteBatch(batch.id, `${batchData.color} - ${batchData.batchNumber}`)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Slett
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Quantity and availability */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Antall:</span>
                      <div className="text-right">
                        <div className="font-medium">
                          {batch.availableQuantity} / {batchData.quantity || batch.totalQuantity} nøster
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {batch.availableQuantity === batch.totalQuantity ? 'Komplett' : 
                           batch.availableQuantity === 0 ? 'Brukt opp' : 'Delvis brukt'}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            batch.availableQuantity === batch.totalQuantity ? 'bg-green-500' :
                            batch.availableQuantity === 0 ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                          style={{ 
                            width: `${Math.round((batch.availableQuantity / batch.totalQuantity) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Price */}
                    {batchData.pricePerSkein && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pris per nøste:</span>
                        <span className="font-medium">{formatPrice(batchData.pricePerSkein)}</span>
                      </div>
                    )}

                    {/* Total value */}
                    {batchData.pricePerSkein && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total verdi:</span>
                        <span className="font-medium">
                          {formatPrice(batchData.pricePerSkein * (batchData.quantity || batch.totalQuantity))}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lokasjon:</span>
                      <span className="font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {batch.location.name}
                      </span>
                    </div>

                    {/* Purchase date */}
                    {batch.purchaseDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Kjøpt:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(batch.purchaseDate)}
                        </span>
                      </div>
                    )}

                    {/* Condition */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tilstand:</span>
                      <Badge variant={batchData.condition === 'Ny' ? 'default' : 'secondary'}>
                        {batchData.condition || 'Ikke angitt'}
                      </Badge>
                    </div>

                    {/* Color code */}
                    {batchData.colorCode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fargekode:</span>
                        <span className="font-medium font-mono text-xs">
                          {batchData.colorCode}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {batchData.notes && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground mb-1">Notater:</div>
                        <div className="text-sm">{batchData.notes}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Bulk Operations - collapsed to save space */}
      {batches && batches.length > 0 && (
        <Collapsible>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm font-medium">Bulk-operasjoner</div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <ChevronDown className="h-4 w-4 mr-1" /> Vis/skjul
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="mt-3">
              <YarnBulkOperations 
                items={batches}
                onRefresh={() => {
                  refetchBatches()
                  refetchTotals()
                }}
                itemType="batches"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Project Integration Section */}
      {batches && batches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Prosjekt-integrasjon</h3>
          <div className="space-y-4">
            {batches.map((batch) => {
              const batchData = getBatchData(batch.categoryData)
              return (
                <YarnProjectIntegration
                  key={batch.id}
                  batchId={batch.id}
                  batchName={`${batchData.color} - ${batchData.batchNumber}`}
                  availableQuantity={batch.availableQuantity}
                  unit={batch.unit || 'nøste'}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
