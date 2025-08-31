'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import {
  CheckSquare,
  Square,
  Move,
  Trash2,
  Tag,
  Package,
  MapPin,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react'

interface BulkActionsProps {
  selectedItems: string[]
  onClearSelection: () => void
  onItemsUpdated?: () => void
  className?: string
}

export function BulkActions({
  selectedItems,
  onClearSelection,
  onItemsUpdated,
  className = ''
}: BulkActionsProps) {
  const [action, setAction] = useState<'move' | 'delete' | 'categorize' | 'tag' | null>(null)
  const [targetLocationId, setTargetLocationId] = useState('')
  const [targetCategoryId, setTargetCategoryId] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Data fetching
  const { data: locations = [] } = (trpc.locations.getAll.useQuery as any)()
  const { data: categories = [] } = (trpc.categories.getAll.useQuery as any)()

  // Mutations
  const updateItemMutation = (trpc.items.update.useMutation as any)({
    onSuccess: (data: any) => {
      toast.success('Gjenstand oppdatert!')
      onItemsUpdated?.()
    },
    onError: (error: any) => {
      toast.error('Kunne ikke oppdatere gjenstand: ' + error.message)
    }
  })

  const deleteItemMutation = trpc.items.delete.useMutation({
    onSuccess: (data: any) => {
      toast.success('Gjenstand slettet!')
      onItemsUpdated?.()
    },
    onError: (error: any) => {
      toast.error('Kunne ikke slette gjenstand: ' + error.message)
    }
  })

  const handleBulkMove = async () => {
    if (!targetLocationId || selectedItems.length === 0) return

    setIsProcessing(true)
    try {
      // Update all selected items to the new location
      const promises = selectedItems.map(itemId =>
        updateItemMutation.mutateAsync({
          id: itemId,
          locationId: targetLocationId
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedItems.length} gjenstander flyttet!`)
      resetAction()
      onClearSelection()
    } catch (error) {
      toast.error('Noen oppdateringer feilet')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return

    const confirmed = window.confirm(
      `Er du sikker på at du vil slette ${selectedItems.length} gjenstander? Dette kan ikke angres.`
    )

    if (!confirmed) return

    setIsProcessing(true)
    try {
      const promises = selectedItems.map(itemId =>
        deleteItemMutation.mutateAsync(itemId)
      )

      await Promise.all(promises)
      toast.success(`${selectedItems.length} gjenstander slettet!`)
      resetAction()
      onClearSelection()
    } catch (error) {
      toast.error('Noen slettinger feilet')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkCategorize = async () => {
    if (!targetCategoryId || selectedItems.length === 0) return

    setIsProcessing(true)
    try {
      const promises = selectedItems.map(itemId =>
        updateItemMutation.mutateAsync({
          id: itemId,
          categoryId: targetCategoryId
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedItems.length} gjenstander kategorisert!`)
      resetAction()
      onClearSelection()
    } catch (error) {
      toast.error('Noen oppdateringer feilet')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetAction = () => {
    setAction(null)
    setTargetLocationId('')
    setTargetCategoryId('')
    setNewTag('')
  }

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">
                {selectedItems.length} gjenstander valgt
              </h3>
              <p className="text-sm text-blue-600">
                Velg hva du vil gjøre med de valgte gjenstandene
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <Button
            variant={action === 'move' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAction(action === 'move' ? null : 'move')}
            className="gap-2"
          >
            <Move className="w-4 h-4" />
            Flytt
          </Button>
          <Button
            variant={action === 'categorize' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAction(action === 'categorize' ? null : 'categorize')}
            className="gap-2"
          >
            <Tag className="w-4 h-4" />
            Kategoriser
          </Button>
          <Button
            variant={action === 'tag' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAction(action === 'tag' ? null : 'tag')}
            className="gap-2"
          >
            <Package className="w-4 h-4" />
            Tagger
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isProcessing}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Slett
          </Button>
        </div>

        {/* Action Details */}
        {action && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              {action === 'move' && (
                <div className="space-y-2">
                  <Label htmlFor="target-location">Flytt til lokasjon</Label>
                  <Select value={targetLocationId} onValueChange={setTargetLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg lokasjon" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location: any) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {location.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleBulkMove}
                    disabled={!targetLocationId || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Move className="w-4 h-4 mr-2" />
                    )}
                    Flytt {selectedItems.length} gjenstander
                  </Button>
                </div>
              )}

              {action === 'categorize' && (
                <div className="space-y-2">
                  <Label htmlFor="target-category">Sett kategori</Label>
                  <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleBulkCategorize}
                    disabled={!targetCategoryId || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Tag className="w-4 h-4 mr-2" />
                    )}
                    Kategoriser {selectedItems.length} gjenstander
                  </Button>
                </div>
              )}

              {action === 'tag' && (
                <div className="space-y-2">
                  <Label htmlFor="new-tag">Legg til tag</Label>
                  <Input
                    id="new-tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="F.eks. viktig, lån, ødelagt"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        // TODO: Implement tag addition
                        toast.info('Tag-funksjonalitet kommer snart!')
                      }}
                      disabled={!newTag.trim() || isProcessing}
                      className="flex-1"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Legg til tag
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetAction}
                    >
                      Avbryt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Warning for large selections */}
        {selectedItems.length > 10 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Du har valgt mange gjenstander ({selectedItems.length}).
                Vær forsiktig med bulk-operasjoner.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Mobile-optimized bulk selection component
export function BulkSelectionControls({
  totalItems,
  selectedItems,
  onSelectAll,
  onClearSelection,
  className = ''
}: {
  totalItems: number
  selectedItems: string[]
  onSelectAll: () => void
  onClearSelection: () => void
  className?: string
}) {
  const allSelected = selectedItems.length === totalItems
  const someSelected = selectedItems.length > 0

  return (
    <div className={`flex items-center justify-between p-3 bg-muted/50 border rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={someSelected ? onClearSelection : onSelectAll}
          className="gap-2"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4" />
          ) : someSelected ? (
            <Square className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {allSelected ? 'Fjern alle' : someSelected ? 'Fjern alle' : 'Velg alle'}
        </Button>

        {someSelected && (
          <Badge variant="secondary" className="px-2 py-1">
            {selectedItems.length} valgt
          </Badge>
        )}
      </div>

      {someSelected && (
        <div className="text-sm text-muted-foreground">
          {selectedItems.length} av {totalItems} gjenstander
        </div>
      )}
    </div>
  )
}
