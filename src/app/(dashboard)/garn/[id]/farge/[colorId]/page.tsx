'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

export default function YarnColorPage() {
  const params = useParams()
  const masterId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
  const colorId = Array.isArray(params?.colorId) ? params.colorId[0] : (params?.colorId as string)

  const { data: colors } = trpc.yarn.getColorsForMaster.useQuery({ masterId }, { enabled: !!masterId })
  const color = colors?.find(c => c.id === colorId)
  const { data: batches } = trpc.yarn.getBatchesForColor.useQuery({ colorId }, { enabled: !!colorId })

  return (
    <div className="space-y-4">
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

      <div>
        <h1 className="text-2xl font-semibold">{color?.name || 'Farge'}</h1>
        {color?.colorCode && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: color.colorCode }} />
            <span className="text-muted-foreground">{color.colorCode}</span>
          </div>
        )}
      </div>

      {/* Batches for this color */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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


