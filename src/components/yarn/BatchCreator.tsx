'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface BatchCreatorProps {
  masterId: string
  onComplete: () => void
}

export function BatchCreator({ masterId, onComplete }: BatchCreatorProps) {
  const [selectedColorId, setSelectedColorId] = useState<string>('')
  const [batchNumber, setBatchNumber] = useState('')
  const [quantity, setQuantity] = useState<number>(1)
  const [pricePerSkein, setPricePerSkein] = useState<number | undefined>()
  const [notes, setNotes] = useState('')

  // Fetch available colors for this master
  const { data: colorsData, isLoading: colorsLoading } = trpc.yarn.getColorsForMaster.useQuery(
    { masterId },
    { enabled: !!masterId }
  )

  // Fetch default location for batch
  const { data: locationsData } = trpc.locations.getAll.useQuery()

  // Create batch mutation
  const createBatchMutation = trpc.yarn.createBatch.useMutation({
    onSuccess: () => {
      toast.success('Batch opprettet!')
      onComplete()
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error('Batch finnes allerede for valgt farge og partinummer')
      } else {
        toast.error('Feil ved opprettelse av batch')
      }
      console.error('BatchCreator Error:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedColorId) {
      toast.error('Velg en farge')
      return
    }
    
    if (!batchNumber.trim()) {
      toast.error('Batch nummer er påkrevd')
      return
    }

    const selectedColor = colorsData?.find(c => c.id === selectedColorId)
    if (!selectedColor) {
      toast.error('Ugyldig farge valgt')
      return
    }

    const locationId = locationsData?.[0]?.id
    if (!locationId) {
      toast.error('Ingen lokasjon tilgjengelig')
      return
    }

    const batchName = `${selectedColor.name} - ${batchNumber}`

    try {
      await createBatchMutation.mutateAsync({
        masterId,
        name: batchName,
        locationId,
        batchNumber,
        color: selectedColor.name,
        colorCode: selectedColor.colorCode || '',
        quantity,
        pricePerSkein,
        notes: notes.trim() || undefined,
        colorId: selectedColorId,
      })
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  if (colorsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Laster farger...
      </div>
    )
  }

  if (!colorsData || colorsData.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">
          Du må ha minst én farge for å opprette en batch.
        </p>
        <p className="text-sm text-muted-foreground">
          Gå tilbake og opprett en farge først.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Color Selection */}
      <div className="space-y-3">
        <Label htmlFor="color-select">Velg farge *</Label>
        <Select value={selectedColorId} onValueChange={setSelectedColorId}>
          <SelectTrigger>
            <SelectValue placeholder="Velg en farge..." />
          </SelectTrigger>
          <SelectContent>
            {colorsData.map((color) => (
              <SelectItem key={color.id} value={color.id}>
                <div className="flex items-center space-x-2">
                  <span>{color.name}</span>
                  {color.colorCode && (
                    <span className="text-muted-foreground text-sm">({color.colorCode})</span>
                  )}
                  <span className="text-muted-foreground text-xs">
                    - {color.batchCount} batches, {color.skeinCount} nøster
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Color Preview */}
      {selectedColorId && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {(() => {
                const selectedColor = colorsData.find(c => c.id === selectedColorId)
                return selectedColor && (
                  <>
                    {selectedColor.imageUrl && (
                      <Image 
                        src={selectedColor.imageUrl} 
                        alt={selectedColor.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-green-800">{selectedColor.name}</div>
                      {selectedColor.colorCode && (
                        <div className="text-sm text-green-600">{selectedColor.colorCode}</div>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="batch-number">Batch nummer *</Label>
          <Input
            id="batch-number"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="f.eks. LOT2024001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Antall nøster *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            required
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price">Pris per nøste (kr) - valgfritt</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={pricePerSkein || ''}
            onChange={(e) => setPricePerSkein(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="89.50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notater - valgfritt</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Eventuelle notater om denne batchen..."
            rows={3}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="submit"
          disabled={createBatchMutation.isPending || !selectedColorId || !batchNumber.trim()}
          className="min-w-32"
        >
          {createBatchMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Oppretter...
            </>
          ) : (
            'Opprett batch'
          )}
        </Button>
      </div>
    </form>
  )
}
