'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
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
import { MapPin, ChevronLeft, Edit, Trash2, QrCode, Plus, Printer } from 'lucide-react'
import { dymoService } from '@/lib/printing/dymo-service'
import { printQueue } from '@/lib/printing/print-queue'
 

export default function BatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
  const { data: session, status } = useSession()

  const { data: batch, refetch } = trpc.items.getById.useQuery(id!, { enabled: !!id })
  const { data: master } = trpc.yarn.getMasterForBatch.useQuery({ batchId: id! }, { enabled: !!id })
  const { data: locations } = trpc.locations.getAllFlat.useQuery(undefined, {})
  const profiles = trpc.users.getLabelProfiles.useQuery(undefined, { enabled: status === 'authenticated' })
  const userProfile = trpc.users.getProfile.useQuery(undefined, { enabled: status === 'authenticated' })
  const [addingDistribution, setAddingDistribution] = React.useState(false)
  const [selectedProfileId, setSelectedProfileId] = React.useState('')

  React.useEffect(() => {
    if (!selectedProfileId && userProfile.data?.defaultLabelProfileId) {
      setSelectedProfileId(userProfile.data.defaultLabelProfileId)
    }
  }, [userProfile.data, selectedProfileId])

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

  if (status !== 'authenticated') return null
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
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={async () => {
                  try {
                    const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                    const labels = (distributions || []).map((dist) => ({
                      itemName: batch.name,
                      locationName: dist.location?.name || 'Lokasjon',
                      qrCode: dist.qrCode,
                      dateAdded: new Date().toLocaleDateString('nb-NO'),
                      extraLine1: profile?.extraLine1,
                      extraLine2: profile?.extraLine2
                    }))
                    if (labels.length > 0) {
                      await dymoService.printBulkLabels(labels, 'qr', { copies: 1 })
                    }
                  } catch (e) {
                    console.error(e)
                  }
                }}>Skriv ut alle (DYMO)</Button>
                <Button size="sm" onClick={() => setAddingDistribution(true)}>
                  <Plus className="h-3 w-3 mr-1" /> Legg til fordeling
                </Button>
              </div>
            </div>
            <div className="border rounded-md divide-y">
              {distributions.length === 0 && !addingDistribution && (
                <div className="p-3 text-sm text-muted-foreground">Ingen fordeling registrert ennå.</div>
              )}
              {distributions.length === 0 && addingDistribution && (
                <div className="p-3">
                  <AddDistributionForm 
                    locations={locations || []}
                    onSubmit={async (values) => {
                      await addDistribution.mutateAsync({
                        itemId: id!,
                        locationId: values.locationId,
                        quantity: values.quantity,
                        notes: values.notes
                      })
                      setAddingDistribution(false)
                    }}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setAddingDistribution(false)}>Avbryt</Button>
                  </div>
                </div>
              )}
              {distributions.length > 0 && addingDistribution && (
                <div className="p-3 bg-muted/30">
                  <AddDistributionForm 
                    locations={locations || []}
                    onSubmit={async (values) => {
                      await addDistribution.mutateAsync({
                        itemId: id!,
                        locationId: values.locationId,
                        quantity: values.quantity,
                        notes: values.notes
                      })
                      setAddingDistribution(false)
                    }}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setAddingDistribution(false)}>Avbryt</Button>
                  </div>
                </div>
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
                        <Button variant="ghost" size="sm" title="Vis QR for fordeling">
                          <QrCode className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>QR-kode for fordeling</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center">
                          <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/scan?d=${d.qrCode}`} title={`${batch.name} @ ${d.location?.name}`} description={`${d.quantity} ${batch.unit || 'nøste'} tilgjengelig`} />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="Skriv ut etikett">
                          <Printer className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Skriv ut fordeling-etikett</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            Kode: <span className="font-mono">{d.qrCode}</span>
                          </div>
                          <div className="flex justify-center">
                            <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/scan?d=${d.qrCode}`} title={`${batch.name}`} description={`${d.location?.name} • ${d.quantity} ${batch.unit || 'nøste'}`} />
                          </div>
                          <div className="border rounded p-2">
                            <div className="text-xs font-medium mb-1">Forhåndsvisning</div>
                            {(() => {
                              const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                              const logo = profile?.logoUrl || userProfile.data?.logoUrl || ''
                              const extra1 = profile?.extraLine1 || ''
                              const extra2 = profile?.extraLine2 || ''
                              const showUrl = profile?.showUrl ?? true
                              const url = typeof window !== 'undefined' ? `${window.location.origin}/scan?d=${d.qrCode}` : ''
                              return (
                                <div className="flex items-start gap-3">
                                  {logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                                  ) : null}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{batch.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{d.location?.name}</div>
                                    {extra1 ? <div className="text-xs text-muted-foreground truncate">{extra1}</div> : null}
                                    {extra2 ? <div className="text-xs text-muted-foreground truncate">{extra2}</div> : null}
                                    <div className="mt-2 flex items-center gap-3">
                                      <div className="w-24">
                                        <QRCode value={url} title={batch.name} description={d.location?.name} />
                                      </div>
                                      <div className="text-[11px]">
                                        <div className="font-mono">{d.qrCode}</div>
                                        {showUrl ? <div className="text-muted-foreground break-all">{url}</div> : null}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })()}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Etikettstørrelse</Label>
                              <select id={`dy-size-${d.id}`} defaultValue="standard" className="w-full border rounded px-2 py-1 text-sm">
                                <option value="small">Liten (30334)</option>
                                <option value="standard">Standard (30252)</option>
                                <option value="large">Stor (30323)</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Kopier</Label>
                              <input id={`dy-copies-${d.id}`} type="number" min={1} max={10} defaultValue={1} className="w-full border rounded px-2 py-1 text-sm" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Etikettmal</Label>
                              <select id={`dy-profile-${d.id}`} className="w-full border rounded px-2 py-1 text-sm" value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)}>
                                <option value="">(Bruk profil-logo/standard)</option>
                                {(profiles.data || []).map((p: any) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                          </div>
                          <div className="flex justify-end">
                            <Button className="mr-2" onClick={() => {
                              const printWindow = window.open('', '_blank')
                              if (printWindow) {
                                const url = `${window.location.origin}/scan?d=${d.qrCode}`
                                const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                                const extra1 = profile?.extraLine1 || ''
                                const extra2 = profile?.extraLine2 || ''
                                const showUrl = profile?.showUrl ?? true
                                const logo = profile?.logoUrl || userProfile.data?.logoUrl || ''
                                const qr = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`
                                printWindow.document.write(`<!DOCTYPE html><html><head><title>Etikett</title><style>body{margin:0;padding:12px;font-family:Arial} .box{border:1px solid #000; padding:8px; width:280px} .title{font-weight:bold; font-size:14px; margin:6px 0} .small{font-size:12px; color:#444} .code{font-family:monospace; font-size:12px}</style></head><body><div class='box'>${logo ? `<img src='${logo}' style='max-width:260px;max-height:40px'/>` : ''}<div class='title'>${batch.name}</div><div class='small'>${d.location?.name}</div>${extra1 ? `<div class='small'>${extra1}</div>` : ''}${extra2 ? `<div class='small'>${extra2}</div>` : ''}<img src='${qr}' style='width:160px;height:160px'/><div class='code'>${d.qrCode}</div>${showUrl ? `<div class='small'>${url}</div>` : ''}</div></body></html>`)
                                printWindow.document.close()
                                setTimeout(() => { printWindow.print(); printWindow.close() }, 250)
                              }
                            }}>Skriv ut</Button>
                            <Button variant="outline" onClick={async () => {
                              try {
                                const copies = Number((document.getElementById(`dy-copies-${d.id}`) as HTMLInputElement)?.value || '1')
                                const size = ((document.getElementById(`dy-size-${d.id}`) as HTMLSelectElement)?.value || 'standard') as 'small'|'standard'|'large'
                                const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                                await dymoService.printQRLabel({
                                  itemName: batch.name,
                                  locationName: d.location?.name || 'Lokasjon',
                                  qrCode: d.qrCode,
                                  dateAdded: new Date().toLocaleDateString('nb-NO'),
                                  extraLine1: profile?.extraLine1,
                                  extraLine2: profile?.extraLine2
                                }, { copies, labelSize: size })
                              } catch (e) {
                                console.error(e)
                              }
                            }}>Skriv ut på DYMO</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Flytt</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Flytt fordeling</DialogTitle>
                        </DialogHeader>
                        <MoveDistributionForm 
                          fromDistributionId={d.id}
                          fromLocationId={d.locationId}
                          locations={(locations || [])}
                          max={d.quantity}
                          unit={batch.unit || 'nøste'}
                          onDone={() => refetch()}
                        />
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Ta ut</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Ta ut fra fordeling</DialogTitle>
                        </DialogHeader>
                        <TakeOutForm distributionId={d.id} max={d.quantity} unit={batch.unit || 'nøste'} onDone={() => refetch()} />
                      </DialogContent>
                    </Dialog>
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

function TakeOutForm({ distributionId, max, unit, onDone }: { distributionId: string, max: number, unit: string, onDone: () => void }) {
  const [amount, setAmount] = React.useState<number>(1)
  const [notes, setNotes] = React.useState<string>('')
  const utils = trpc.useUtils()
  const consume = trpc.items.consumeFromDistribution.useMutation({
    onSuccess: () => { utils.items.getById.invalidate(); onDone(); toast.success('Uttak registrert') },
    onError: () => toast.error('Kunne ikke gjennomføre uttak')
  })
  const giveBack = trpc.items.returnToDistribution.useMutation({
    onSuccess: () => { utils.items.getById.invalidate(); onDone(); toast.success('Lagt tilbake') },
    onError: () => toast.error('Kunne ikke legge tilbake')
  })
  return (
    <div className="space-y-3">
      <div>
        <Label>Antall (max {max})</Label>
        <Input type="number" min={0} max={max} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div>
        <Label>Notater</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button disabled={consume.isPending || amount <= 0 || amount > max} onClick={() => consume.mutate({ distributionId, amount, notes: notes || undefined })}>
          {consume.isPending ? 'Tar ut...' : `Ta ut ${unit}`}
        </Button>
        <Button variant="outline" className="ml-2" disabled={giveBack.isPending || amount <= 0} onClick={() => giveBack.mutate({ distributionId, amount, notes: notes || undefined })}>
          {giveBack.isPending ? 'Legger tilbake...' : 'Legg tilbake'}
        </Button>
      </div>
    </div>
  )
}

function MoveDistributionForm({ fromDistributionId, fromLocationId, locations, max, unit, onDone }: { fromDistributionId: string, fromLocationId: string, locations: Array<{ id: string, name: string }>, max: number, unit: string, onDone: () => void }) {
  const availableTargets = (locations || []).filter(l => l.id !== fromLocationId)
  const [toLocationId, setToLocationId] = React.useState<string>(availableTargets[0]?.id || '')
  const [amount, setAmount] = React.useState<number>(1)
  const [notes, setNotes] = React.useState<string>('')
  const moveMutation = trpc.items.moveBetweenDistributions.useMutation({
    onSuccess: () => { onDone(); toast.success('Flyttet') },
    onError: () => toast.error('Kunne ikke flytte')
  })
  return (
    <div className="space-y-3">
      <div>
        <Label>Mål-lokasjon</Label>
        <Select value={toLocationId} onValueChange={setToLocationId}>
          <SelectTrigger>
            <SelectValue placeholder="Velg lokasjon" />
          </SelectTrigger>
          <SelectContent>
            {availableTargets.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Antall (max {max})</Label>
        <Input type="number" min={0} max={max} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div>
        <Label>Notater</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button disabled={moveMutation.isPending || amount <= 0 || amount > max || !toLocationId} onClick={() => moveMutation.mutate({ fromDistributionId, toLocationId, amount, notes: notes || undefined })}>
          {moveMutation.isPending ? 'Flytter...' : `Flytt ${unit}`}
        </Button>
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


