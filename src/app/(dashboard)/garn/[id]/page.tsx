'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { BatchGrid } from '@/components/yarn/BatchGrid'
import { trpc } from '@/lib/trpc/client'

export default function YarnDetailPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
  const { data: master } = trpc.items.getById.useQuery(id!, { enabled: !!id })
  const { data: totals } = trpc.yarn.getMasterTotals.useQuery({ masterId: id! }, { enabled: !!id })

  if (!id) return null

  const data = master?.categoryData ? JSON.parse(master.categoryData) : {}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/garn">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Til oversikten
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Compact header: text left, image right */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Text */}
            <div className="md:col-span-2 space-y-2">
              <h1 className="text-2xl font-semibold leading-tight">{master?.name}</h1>
              <div className="text-sm text-muted-foreground">
                {data.producer || 'Ukjent produsent'}{data.composition ? ` • ${data.composition}` : ''}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mt-2">
                <div>
                  <div className="text-muted-foreground">Vekt</div>
                  <div className="font-medium">{data.weight || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Løpelengde</div>
                  <div className="font-medium">{data.yardage || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Pinner</div>
                  <div className="font-medium">{data.needleSize || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Strikkefasthet</div>
                  <div className="font-medium">{data.gauge || '—'}</div>
                </div>
              </div>
              {data.careInstructions && (
                <div className="text-sm mt-2">
                  <span className="text-muted-foreground">Vaskeråd: </span>
                  {data.careInstructions}
                </div>
              )}

              {/* Minimal stats row placed last */}
              {totals && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mt-2">
                  <div>
                    <div className="text-muted-foreground">Totalt nøster</div>
                    <div className="font-medium">{totals.totalSkeins}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tilgjengelig</div>
                    <div className="font-medium">{totals.availableSkeins}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total verdi</div>
                    <div className="font-medium">{`${Math.round(totals.totalValue)} kr`}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Batches</div>
                    <div className="font-medium">{totals.batchCount}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Image + actions under */}
            <div className="md:col-span-1">
              <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                {master?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={master.imageUrl} alt={master.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                    Ingen bilde
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button size="sm" variant="secondary">
                  <Download className="h-3 w-3 mr-1" /> Last ned bilde
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" /> Legg til batch
                </Button>
              </div>
            </div>
          </div>

          {/* Batches */}
          <div className="mt-6">
            <BatchGrid masterId={id} hideMasterHeader hideTotals />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


