'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { BatchGrid } from '@/components/yarn/BatchGrid'
import { trpc } from '@/lib/trpc/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { YarnBulkOperations } from '@/components/yarn/YarnBulkOperations'
import { YarnProjectIntegration } from '@/components/yarn/YarnProjectIntegration'

export default function YarnDetailPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
  const { data: master } = trpc.items.getById.useQuery(id!, { enabled: !!id })
  const { data: totals } = trpc.yarn.getMasterTotals.useQuery({ masterId: id! }, { enabled: !!id })
  const { data: colors } = trpc.yarn.getColorsForMaster.useQuery({ masterId: id! }, { enabled: !!id })
  const { data: batches } = trpc.yarn.getBatchesForMaster.useQuery({ masterId: id! }, { enabled: !!id })
  const utils = trpc.useUtils()
  const [selectedColor, setSelectedColor] = React.useState<string>('')

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
        <CardContent className="pt-4">
          {/* Compact header: text left, image right */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Text */}
            <div className="md:col-span-2 space-y-2">
              <h1 className="text-2xl font-semibold leading-tight">{master?.name}</h1>
              <div className="text-sm text-muted-foreground">
                {data.producer || 'Ukjent produsent'}{data.composition ? ` • ${data.composition}` : ''}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mt-1">
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
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">Vaskeråd: </span>
                  {data.careInstructions}
                </div>
              )}

              {/* Minimal stats row placed last */}
              {totals && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mt-1">
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
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Button size="sm" variant="secondary">
                  <Download className="h-3 w-3 mr-1" /> Last ned bilde
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" /> Legg til batch
                </Button>
                {/* Bulk-operasjoner dialog */}
                {(batches && batches.length > 0) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Bulk-operasjoner</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Bulk-operasjoner for batches</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2">
                      <YarnBulkOperations 
                        items={batches || []}
                        itemType="batches"
                        onRefresh={() => {
                          utils.yarn.getBatchesForMaster.invalidate({ masterId: id! })
                          utils.yarn.getMasterTotals.invalidate({ masterId: id! })
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                )}
                {/* Legg til prosjekt dialog */}
                {(batches && batches.length > 0) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Legg til prosjekt</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Legg batches til prosjekt</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                      {(batches || []).map((b) => {
                        const data = b.categoryData ? JSON.parse(b.categoryData) : {}
                        return (
                          <YarnProjectIntegration
                            key={b.id}
                            batchId={b.id}
                            batchName={`${data.color || ''} - ${data.batchNumber || ''}`}
                            availableQuantity={b.availableQuantity}
                            unit={b.unit || 'nøste'}
                          />
                        )
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </div>
          </div>

          {/* Colors grid (compact) */}
          {colors && colors.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Farger</h3>
                <div className="text-xs text-muted-foreground">Filter: {selectedColor || 'Ingen'}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {colors.map((c) => (
                  <button key={c.id} onClick={() => setSelectedColor(prev => prev === c.name ? '' : c.name)} className={`rounded-lg border p-3 text-left transition-colors ${selectedColor === c.name ? 'bg-muted' : 'hover:bg-muted/40'}`}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: c.colorCode || '#e5e7eb' }} />
                      <span className="text-sm font-medium truncate">{c.name}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                      <span>{c.batchCount} batches</span>
                      <span>{c.skeinCount} nøster</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Batches */}
          <div className="mt-4">
            <BatchGrid masterId={id} hideMasterHeader hideTotals filterColorName={selectedColor || undefined} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


