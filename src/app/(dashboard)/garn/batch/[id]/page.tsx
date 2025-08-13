'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { QRCode } from '@/components/ui/qr-code'
import { toast } from 'sonner'
import { MapPin, ChevronLeft, Edit, Trash2, QrCode, Plus } from 'lucide-react'

export default function BatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)

  const { data: batch, refetch } = trpc.items.getById.useQuery(id!, { enabled: !!id })
  const { data: master } = trpc.yarn.getMasterForBatch.useQuery({ batchId: id! }, { enabled: !!id })
  const { data: locations } = trpc.locations.getAllFlat.useQuery(undefined, {})

  const addDistribution = trpc.items.addDistribution.useMutation({
    onSuccess: () => { toast.success('Fordeling lagt til'); refetch() },
    onError: () => toast.error('Kunne ikke legge til fordeling')
  })
  const updateDistribution = trpc.items.updateDistribution.useMutation({
    onSuccess: () => { toast.success('Fordeling oppdatert'); refetch() },
    onError: () => toast.error('Kunne ikke oppdatere fordeling')
  })
  const removeDistribution = trpc.items.removeDistribution.useMutation({
    onSuccess: () => { toast.success('Fordeling fjernet'); refetch() },
    onError: () => toast.error('Kunne ikke fjerne fordeling')
  })

  if (!id) return null
  if (!batch) return null

  const data = batch.categoryData ? JSON.parse(batch.categoryData) : {}
  const distributions = batch.distributions || []
  const totalDistributed = distributions.reduce((sum, d) => sum + (d.quantity || 0), 0)

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const qrValue = `${appOrigin}/garn/batch/${id}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href={`/garn/${master?.id || ''}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Til master
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 space-y-2">
              <h1 className="text-2xl font-semibold leading-tight">{batch.name}</h1>
              <div className="text-sm text-muted-foreground">
                {data.color || 'Ukjent farge'}{data.colorCode ? ` • ${data.colorCode}` : ''}{data.batchNumber ? ` • Batch: ${data.batchNumber}` : ''}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mt-1">
                <div>
                  <div className="text-muted-foreground">Antall totalt</div>
                  <div className="font-medium">{batch.totalQuantity} {batch.unit || 'nøste'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Tilgjengelig</div>
                  <div className="font-medium">{batch.availableQuantity} {batch.unit || 'nøste'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Fordelt</div>
                  <div className="font-medium">{totalDistributed} {batch.unit || 'nøste'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Lokasjon</div>
                  <div className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {batch.location?.name}</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="aspect-square w-full overflow-hidden rounded-md bg-muted md:w-56 md:h-56 md:mx-auto">
                {batch.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={batch.imageUrl} alt={batch.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">Ingen bilde</div>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><QrCode className="h-3 w-3 mr-1" /> Vis QR</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>QR-kode for batch</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                      <QRCode value={qrValue} title={batch.name} description="Skann for å åpne batch" />
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(qrValue).then(() => toast.success('Lenke kopiert'))}>Kopier lenke</Button>
              </div>
            </div>
          </div>

          {/* Fordeling over lokasjoner */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Lokasjonsfordeling</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-3 w-3 mr-1" /> Legg til fordeling</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ny fordeling</DialogTitle>
                  </DialogHeader>
                  <AddDistributionForm 
                    locations={locations || []}
                    onSubmit={async (values) => {
                      await addDistribution.mutateAsync({
                        itemId: id!,
                        locationId: values.locationId,
                        quantity: values.quantity,
                        notes: values.notes
                      })
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div className="border rounded-md divide-y">
              {distributions.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">Ingen fordeling registrert ennå.</div>
              )}
              {distributions.map((d) => (
                <div key={d.id} className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.location?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{d.notes || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-mono">{d.quantity} {batch.unit || 'nøste'}</div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost"><Edit className="h-3 w-3" /></Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Rediger fordeling</DialogTitle>
                        </DialogHeader>
                        <EditDistributionForm 
                          distribution={d}
                          locations={locations || []}
                          onSubmit={async (values) => {
                            await updateDistribution.mutateAsync({
                              distributionId: d.id,
                              locationId: values.locationId,
                              quantity: values.quantity,
                              notes: values.notes
                            })
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => removeDistribution.mutate({ distributionId: d.id })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AddDistributionForm({ locations, onSubmit }: { locations: Array<{ id: string, name: string }>, onSubmit: (v: { locationId: string, quantity: number, notes?: string }) => Promise<void> }) {
  const [locationId, setLocationId] = React.useState('')
  const [quantity, setQuantity] = React.useState<number>(0)
  const [notes, setNotes] = React.useState('')

  return (
    <div className="space-y-3">
      <div>
        <Label>Lokasjon</Label>
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger>
            <SelectValue placeholder="Velg lokasjon" />
          </SelectTrigger>
          <SelectContent>
            {locations.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Antall</Label>
        <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </div>
      <div>
        <Label>Notater</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button onClick={async () => {
          if (!locationId || quantity <= 0) return
          await onSubmit({ locationId, quantity, notes: notes || undefined })
        }}>Lagre</Button>
      </div>
    </div>
  )
}

function EditDistributionForm({ distribution, locations, onSubmit }: { distribution: any, locations: Array<{ id: string, name: string }>, onSubmit: (v: { locationId: string, quantity: number, notes?: string }) => Promise<void> }) {
  const [locationId, setLocationId] = React.useState(distribution.locationId as string)
  const [quantity, setQuantity] = React.useState<number>(distribution.quantity as number)
  const [notes, setNotes] = React.useState(distribution.notes || '')

  return (
    <div className="space-y-3">
      <div>
        <Label>Lokasjon</Label>
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger>
            <SelectValue placeholder="Velg lokasjon" />
          </SelectTrigger>
          <SelectContent>
            {locations.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Antall</Label>
        <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </div>
      <div>
        <Label>Notater</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button onClick={async () => {
          if (!locationId || quantity <= 0) return
          await onSubmit({ locationId, quantity, notes: notes || undefined })
        }}>Lagre</Button>
      </div>
    </div>
  )
}


