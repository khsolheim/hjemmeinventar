'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Pencil, Trash2, Plus } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { YarnWizard } from '@/components/yarn/YarnWizard'

export default function YarnColorPage() {
  const params = useParams()
  const masterId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
  const colorId = Array.isArray(params?.colorId) ? params.colorId[0] : (params?.colorId as string)

  const utils = trpc.useUtils()
  const { data: colors } = trpc.yarn.getColorsForMaster.useQuery({ masterId }, { enabled: !!masterId })
  const color = colors?.find(c => c.id === colorId)
  const { data: batches } = trpc.yarn.getBatchesForColor.useQuery({ colorId }, { enabled: !!colorId })
  const updateColor = trpc.yarn.updateColor.useMutation({ onSuccess: () => utils.yarn.getColorsForMaster.invalidate({ masterId }) })
  const deleteColor = trpc.yarn.deleteColor.useMutation({ onSuccess: () => utils.yarn.getColorsForMaster.invalidate({ masterId }) })

  return (
    <div className="page container mx-auto px-4 py-8 cq space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href={`/garn/${masterId}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Til garntype
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">
          {color ? `${color.batchCount} batches • ${color.skeinCount} nøster` : ''}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{color?.name || 'Farge'}</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => {
            const name = prompt('Nytt navn på farge', color?.name || '')
            const code = prompt('Ny fargekode (valgfritt, f.eks. #FFB6C1)', color?.colorCode || '')
            if (name) updateColor.mutate({ colorId, name, colorCode: code || undefined })
          }}>
            <Pencil className="h-3 w-3 mr-1"/> Rediger
          </Button>
          <Button size="sm" variant="destructive" onClick={() => {
            if (confirm('Slette denne fargen? (Kun mulig hvis ingen batches er knyttet)')) deleteColor.mutate({ colorId })
          }}>
            <Trash2 className="h-3 w-3 mr-1"/> Slett
          </Button>
        </div>
      </div>
      {color?.colorCode && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: color.colorCode }} />
          <span className="text-muted-foreground">{color.colorCode}</span>
        </div>
      )}

      {/* Batches for this color */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{batches?.length || 0} batches</div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-3 w-3 mr-1"/> Ny batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ny batch for {color?.name}</DialogTitle>
            </DialogHeader>
            <YarnWizard onComplete={() => utils.yarn.getBatchesForColor.invalidate({ colorId })} preset={{ masterId, batch: { color: color?.name, colorCode: color?.colorCode } }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="cq-grid yarn-grid gap-4" style={{"--card-min":"220px"} as any}>
        {(batches || []).map(b => {
          const data = b.categoryData ? JSON.parse(b.categoryData) : {}
          return (
            <div key={b.id} className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Batch</div>
              <div className="font-medium">{data.batchNumber}</div>
              <div className="mt-2 text-sm flex justify-between">
                <span>Antall</span>
                <span className="font-medium">{b.availableQuantity} / {b.totalQuantity}</span>
              </div>
              {data.pricePerSkein && (
                <div className="text-sm flex justify-between">
                  <span>Pris pr nøste</span>
                  <span className="font-medium">{data.pricePerSkein} kr</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">Lokasjon: {b.location?.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


