'use client'

import { useState } from 'react'
import { 
  CheckSquare, 
  Square, 
  Edit, 
  Trash2, 
  Move, 
  Download, 
  Upload, 
  DollarSign,
  Package,
  MapPin,
  Filter,
  X,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface YarnBulkOperationsProps {
  items: any[]
  onRefresh: () => void
  itemType: 'masters' | 'batches'
}

export function YarnBulkOperations({ items, onRefresh, itemType }: YarnBulkOperationsProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showOperations, setShowOperations] = useState(false)
  const [bulkEditData, setBulkEditData] = useState({
    pricePerSkein: '',
    condition: 'none',
    locationId: '',
    notes: ''
  })
  const [filterOpen, setFilterOpen] = useState(false)

  // Fetch locations for bulk move
  const { data: locations } = trpc.locations.getAll.useQuery()

  // Mutations
  const bulkUpdateMutation = trpc.yarn.bulkUpdateBatches.useMutation({
    onSuccess: () => {
      toast.success(`${selectedItems.size} items oppdatert`)
      setSelectedItems(new Set())
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const bulkDeleteMutation = trpc.yarn.bulkDeleteItems.useMutation({
    onSuccess: () => {
      toast.success(`${selectedItems.size} items slettet`)
      setSelectedItems(new Set())
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const bulkMoveMutation = trpc.yarn.bulkMoveItems.useMutation({
    onSuccess: () => {
      toast.success(`${selectedItems.size} items flyttet`)
      setSelectedItems(new Set())
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(item => item.id)))
    }
  }

  const toggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleBulkUpdate = async () => {
    const updateData: any = {}
    
    if (bulkEditData.pricePerSkein) {
      updateData.pricePerSkein = parseFloat(bulkEditData.pricePerSkein)
    }
    if (bulkEditData.condition && bulkEditData.condition !== 'none') {
      updateData.condition = bulkEditData.condition
    }
    if (bulkEditData.notes) {
      updateData.notes = bulkEditData.notes
    }

    if (Object.keys(updateData).length === 0) {
      toast.error('Velg minst ett felt å oppdatere')
      return
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        itemIds: Array.from(selectedItems),
        updateData
      })
    } catch (error) {
      // Error handled in mutation
    }
  }

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync({
        itemIds: Array.from(selectedItems)
      })
    } catch (error) {
      // Error handled in mutation
    }
  }

  const handleBulkMove = async (locationId: string) => {
    try {
      await bulkMoveMutation.mutateAsync({
        itemIds: Array.from(selectedItems),
        locationId
      })
    } catch (error) {
      // Error handled in mutation
    }
  }

  const exportSelected = () => {
    const selectedData = items.filter(item => selectedItems.has(item.id))
    
    const csvData = selectedData.map(item => {
      const itemData = item.categoryData ? JSON.parse(item.categoryData) : {}
      return {
        'Navn': item.name,
        'Produsent': itemData.producer || '',
        'Farge': itemData.color || '',
        'Batch': itemData.batchNumber || '',
        'Antall': item.totalQuantity || 0,
        'Tilgjengelig': item.availableQuantity || 0,
        'Pris per nøste': itemData.pricePerSkein || '',
        'Tilstand': itemData.condition || '',
        'Lokasjon': item.location?.name || '',
        'Opprettet': new Date(item.createdAt).toLocaleDateString('no-NO')
      }
    })

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `garn-${itemType}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast.success(`${selectedData.length} items eksportert til CSV`)
  }

  const selectedItemsData = items.filter(item => selectedItems.has(item.id))
  const totalValue = selectedItemsData.reduce((sum, item) => {
    const itemData = item.categoryData ? JSON.parse(item.categoryData) : {}
    const price = itemData.pricePerSkein || 0
    const quantity = item.totalQuantity || 0
    return sum + (price * quantity)
  }, 0)

  return (
    <div className="space-y-4">
      {/* Bulk Selection Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bulk-operasjoner
              </CardTitle>
              <CardDescription>
                Administrer flere {itemType === 'masters' ? 'garntyper' : 'batches'} samtidig
              </CardDescription>
            </div>
            <Collapsible open={showOperations} onOpenChange={setShowOperations}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {selectedItems.size > 0 ? `${selectedItems.size} valgt` : 'Velg items'}
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showOperations ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedItems.size === items.length && items.length > 0}
                onCheckedChange={toggleSelectAll}
                className="data-[state=checked]:bg-primary"
              />
              <Label className="text-sm cursor-pointer" onClick={toggleSelectAll}>
                Velg alle ({items.length})
              </Label>
            </div>

            {selectedItems.size > 0 && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{selectedItems.size} valgt</span>
                {totalValue > 0 && (
                  <span>• Verdi: {totalValue.toFixed(0)} kr</span>
                )}
              </div>
            )}
          </div>

          {/* Item Selection Grid */}
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <div className="space-y-1 p-2">
              {items.map((item) => {
                const itemData = item.categoryData ? JSON.parse(item.categoryData) : {}
                return (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer ${
                      selectedItems.has(item.id) ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => toggleSelectItem(item.id)}
                  >
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleSelectItem(item.id)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {itemType === 'batches' 
                          ? `${itemData.color || ''} • ${itemData.batchNumber || ''}`
                          : `${itemData.producer || ''} • ${itemData.composition || ''}`
                        }
                      </div>
                    </div>
                    
                    <div className="text-right text-sm">
                      <div>{item.availableQuantity} {item.unit}</div>
                      {itemData.pricePerSkein && (
                        <div className="text-xs text-muted-foreground">
                          {itemData.pricePerSkein}kr/st
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bulk Operations Panel */}
          <Collapsible open={showOperations} onOpenChange={setShowOperations}>
            <CollapsibleContent className="mt-4">
              {selectedItems.size > 0 && (
                <Tabs defaultValue="edit" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="edit">Rediger</TabsTrigger>
                    <TabsTrigger value="move">Flytt</TabsTrigger>
                    <TabsTrigger value="export">Eksporter</TabsTrigger>
                    <TabsTrigger value="delete">Slett</TabsTrigger>
                  </TabsList>

                  {/* Bulk Edit */}
                  <TabsContent value="edit" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Bulk-redigering
                        </CardTitle>
                        <CardDescription>
                          Oppdater felter for {selectedItems.size} valgte items
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {itemType === 'batches' && (
                          <>
                            <div>
                              <Label htmlFor="bulk-price">Pris per nøste (kr)</Label>
                              <Input
                                id="bulk-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={bulkEditData.pricePerSkein}
                                onChange={(e) => setBulkEditData({...bulkEditData, pricePerSkein: e.target.value})}
                                placeholder="La stå tom for å ikke endre"
                              />
                            </div>

                            <div>
                              <Label htmlFor="bulk-condition">Tilstand</Label>
                              <Select 
                                value={bulkEditData.condition} 
                                onValueChange={(value) => setBulkEditData({...bulkEditData, condition: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Velg tilstand (eller la stå tom)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Ingen endring</SelectItem>
                                  <SelectItem value="Ny">Ny</SelectItem>
                                  <SelectItem value="Brukt - god">Brukt - god</SelectItem>
                                  <SelectItem value="Brukt - ok">Brukt - ok</SelectItem>
                                  <SelectItem value="Brukt - dårlig">Brukt - dårlig</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        <div>
                          <Label htmlFor="bulk-notes">Notater</Label>
                          <Input
                            id="bulk-notes"
                            value={bulkEditData.notes}
                            onChange={(e) => setBulkEditData({...bulkEditData, notes: e.target.value})}
                            placeholder="Legg til eller erstatt notater"
                          />
                        </div>

                        <Button 
                          onClick={handleBulkUpdate}
                          disabled={bulkUpdateMutation.isPending}
                          className="w-full"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {bulkUpdateMutation.isPending ? 'Oppdaterer...' : `Oppdater ${selectedItems.size} items`}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Bulk Move */}
                  <TabsContent value="move" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Move className="h-4 w-4" />
                          Bulk-flytting
                        </CardTitle>
                        <CardDescription>
                          Flytt {selectedItems.size} items til ny lokasjon
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Velg ny lokasjon</Label>
                          <div className="grid grid-cols-1 gap-2 mt-2">
                            {(locations || []).map((location) => (
                              <Button
                                key={location.id}
                                variant="outline"
                                className="justify-start"
                                onClick={() => handleBulkMove(location.id)}
                                disabled={bulkMoveMutation.isPending}
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                {location.name}
                                {location.isDefault && (
                                  <Badge variant="secondary" className="ml-2">Standard</Badge>
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Export */}
                  <TabsContent value="export" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Eksporter data
                        </CardTitle>
                        <CardDescription>
                          Last ned {selectedItems.size} valgte items som CSV
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={exportSelected} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Eksporter til CSV
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Delete */}
                  <TabsContent value="delete" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          Bulk-sletting
                        </CardTitle>
                        <CardDescription>
                          Slett {selectedItems.size} valgte items permanent
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <Trash2 className="h-4 w-4 text-red-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-red-800">
                                Advarsel: Permanent sletting
                              </div>
                              <div className="text-sm text-red-700 mt-1">
                                Denne operasjonen kan ikke angres. Alle valgte items vil bli slettet permanent.
                              </div>
                            </div>
                          </div>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Slett {selectedItems.size} items
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bekreft sletting</AlertDialogTitle>
                              <AlertDialogDescription>
                                Er du sikker på at du vil slette {selectedItems.size} valgte items? 
                                Denne operasjonen kan ikke angres.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Avbryt</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleBulkDelete}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={bulkDeleteMutation.isPending}
                              >
                                {bulkDeleteMutation.isPending ? 'Sletter...' : 'Slett permanent'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardContent>
                    </Card>
                  </TabsContent>

                </Tabs>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}
