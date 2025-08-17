'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, CheckCircle, Plus, Trash2, AlertTriangle, Edit, Save, X, Upload, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { YarnBulkOperations } from '@/components/yarn/YarnBulkOperations'
import { YarnProjectIntegration } from '@/components/yarn/YarnProjectIntegration'
import { BatchCreator } from '@/components/yarn/BatchCreator'
import { BatchGrid } from '@/components/yarn/BatchGrid'

type ColorInfo = { id: string, name: string, colorCode?: string, batchCount: number, skeinCount: number }

export function YarnMasterDetail({
  id,
  initialMaster,
  initialTotals,
  initialColors,
}: {
  id: string
  initialMaster?: any
  initialTotals?: any
  initialColors?: ColorInfo[]
}) {
  const { data: master, isLoading: masterLoading } = trpc.items.getById.useQuery(id, {
    enabled: !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
    initialData: initialMaster,
  })
  const { data: totals, isLoading: totalsLoading } = trpc.yarn.getMasterTotals.useQuery({ masterId: id }, {
    enabled: !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
    initialData: initialTotals,
  })
  const { data: colors, isLoading: colorsLoading } = trpc.yarn.getColorsForMaster.useQuery({ masterId: id }, {
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev,
    initialData: initialColors,
  })
  const { data: batches } = trpc.yarn.getBatchesForMaster.useQuery({ masterId: id }, {
    enabled: !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  })
  const utils = trpc.useUtils()
  const [isAddBatchOpen, setIsAddBatchOpen] = React.useState(false)
  const [selectedColor, setSelectedColor] = React.useState<string>('')
  const [selectedColorId, setSelectedColorId] = React.useState<string>('')
  const [selectedColorCode, setSelectedColorCode] = React.useState<string>('')
  const [isAddColorsOpen, setIsAddColorsOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingColorId, setEditingColorId] = React.useState<string | null>(null)
  const [colorEditData, setColorEditData] = React.useState<{
    name: string
    colorCode: string
    imageUrl: string
  }>({
    name: '',
    colorCode: '',
    imageUrl: ''
  })
  const [editData, setEditData] = React.useState<{
    name: string
    producer: string
    composition: string
    weight: string
    yardage: string
    gauge: string
    needleSize: string
    careInstructions: string
    imageUrl: string
  }>({
    name: '',
    producer: '',
    composition: '',
    weight: '',
    yardage: '',
    gauge: '',
    needleSize: '',
    careInstructions: '',
    imageUrl: ''
  })
  const [colorRows, setColorRows] = React.useState<Array<{ name: string; colorCode: string; imageUrl?: string }>>([
    { name: '', colorCode: '' }
  ])

  const createColor = trpc.yarn.createColor.useMutation()
  const deleteMaster = trpc.yarn.deleteMaster.useMutation()
  const updateMaster = trpc.yarn.updateMaster.useMutation()
  const deleteColor = trpc.yarn.deleteColor.useMutation()
  const updateColor = trpc.yarn.updateColor.useMutation()

  const addRow = () => setColorRows((r) => [...r, { name: '', colorCode: '' }])
  const removeRow = (idx: number) => setColorRows((r) => r.filter((_, i) => i !== idx))
  const updateRow = (idx: number, key: 'name'|'colorCode'|'imageUrl', value: string) => {
    setColorRows((rows) => rows.map((row, i) => i === idx ? { ...row, [key]: value } : row))
  }

  const saveColors = async () => {
    try {
      const rows = colorRows.map(r => ({ ...r, name: r.name.trim(), colorCode: r.colorCode.trim() }))
      const invalid = rows.find(r => !r.name)
      if (invalid) {
        toast.error('Alle rader må ha et navn på fargen')
        return
      }
      await Promise.all(rows.map(async (r) => {
        try {
          await createColor.mutateAsync({ masterId: id, name: r.name, colorCode: r.colorCode || undefined, imageUrl: r.imageUrl || undefined })
        } catch (e) {
          console.error('createColor failed', e)
        }
      }))
      toast.success('Farger lagt til')
      setIsAddColorsOpen(false)
      setColorRows([{ name: '', colorCode: '' }])
      utils.yarn.getColorsForMaster.invalidate({ masterId: id })
      utils.yarn.getAllMasterColors.invalidate()
    } catch (e) {
      toast.error('Kunne ikke lagre farger')
    }
  }

  const handleDeleteMaster = async () => {
    try {
      await deleteMaster.mutateAsync({ id })
      toast.success('Garn-type slettet')
      setIsDeleteDialogOpen(false)
      // Redirect to garn overview
      window.location.href = '/garn'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kunne ikke slette garn-type'
      toast.error(errorMessage)
      console.error('Delete master failed:', error)
    }
  }

  const startEditing = () => {
    const data = master?.categoryData ? JSON.parse(master.categoryData) : {}
    setEditData({
      name: master?.name || '',
      producer: data.producer || '',
      composition: data.composition || '',
      weight: data.weight || '',
      yardage: data.yardage?.toString() || '',
      gauge: data.gauge || '',
      needleSize: data.needleSize || '',
      careInstructions: data.careInstructions || '',
      imageUrl: master?.imageUrl || ''
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditData({
      name: '',
      producer: '',
      composition: '',
      weight: '',
      yardage: '',
      gauge: '',
      needleSize: '',
      careInstructions: '',
      imageUrl: ''
    })
  }

  const saveChanges = async () => {
    try {
      await updateMaster.mutateAsync({
        id,
        name: editData.name,
        imageUrl: editData.imageUrl,
        categoryData: {
          producer: editData.producer,
          composition: editData.composition,
          weight: editData.weight,
          yardage: editData.yardage ? parseFloat(editData.yardage) : undefined,
          gauge: editData.gauge,
          needleSize: editData.needleSize,
          careInstructions: editData.careInstructions
        }
      })
      toast.success('Garn-type oppdatert')
      setIsEditing(false)
      // Refresh the data
      utils.items.getById.invalidate(id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kunne ikke oppdatere garn-type'
      toast.error(errorMessage)
      console.error('Update master failed:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setEditData(prev => ({ ...prev, imageUrl: result.url }))
      toast.success('Bilde lastet opp')
    } catch (error) {
      toast.error('Kunne ikke laste opp bilde')
      console.error('Image upload failed:', error)
    }
  }

  const handleDeleteColor = async (colorId: string, colorName: string) => {
    if (!confirm(`Er du sikker på at du vil slette fargen "${colorName}" og alle tilknyttede batches? Denne handlingen kan ikke angres.`)) {
      return
    }

    try {
      await deleteColor.mutateAsync({ id: colorId })
      toast.success('Farge slettet')
      // Clear selection if the deleted color was selected
      if (selectedColorId === colorId) {
        setSelectedColor('')
        setSelectedColorId('')
        setSelectedColorCode('')
      }
      // Refresh the data
      utils.yarn.getColorsForMaster.invalidate({ masterId: id })
      utils.yarn.getBatchesForMaster.invalidate({ masterId: id })
      utils.yarn.getMasterTotals.invalidate({ masterId: id })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kunne ikke slette farge'
      toast.error(errorMessage)
      console.error('Delete color failed:', error)
    }
  }

  const startEditingColor = (color: any) => {
    setColorEditData({
      name: color.name,
      colorCode: color.colorCode || '',
      imageUrl: color.imageUrl || ''
    })
    setEditingColorId(color.id)
  }

  const cancelEditingColor = () => {
    setEditingColorId(null)
    setColorEditData({
      name: '',
      colorCode: '',
      imageUrl: ''
    })
  }

  const saveColorChanges = async () => {
    if (!editingColorId) return

    try {
      await updateColor.mutateAsync({
        id: editingColorId,
        name: colorEditData.name,
        colorCode: colorEditData.colorCode,
        imageUrl: colorEditData.imageUrl
      })
      toast.success('Farge oppdatert')
      setEditingColorId(null)
      // Refresh the data
      utils.yarn.getColorsForMaster.invalidate({ masterId: id })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kunne ikke oppdatere farge'
      toast.error(errorMessage)
      console.error('Update color failed:', error)
    }
  }

  const data = master?.categoryData ? JSON.parse(master.categoryData) : {}
  const isInitialLoading = masterLoading || totalsLoading || colorsLoading

  return (
    <div className="page container mx-auto px-4 py-8 cq space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/garn">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Til oversikten
          </Link>
        </Button>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={saveChanges} disabled={updateMaster.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMaster.isPending ? 'Lagrer...' : 'Lagre'}
              </Button>
              <Button variant="outline" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-2" />
                Avbryt
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEditing}>
              <Edit className="h-4 w-4 mr-2" />
              Rediger
            </Button>
          )}
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Slett garn-type
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Slett garn-type
              </DialogTitle>
              <DialogDescription>
                Er du sikker på at du vil slette denne garn-typen? <strong>{master?.name}</strong>
                <br /><br />
                Dette vil også slette alle tilknyttede farger og batch. Denne handlingen kan ikke angres.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteMaster.isPending}
              >
                Avbryt
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteMaster}
                disabled={deleteMaster.isPending}
              >
                {deleteMaster.isPending ? 'Sletter...' : 'Slett permanent'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 min-h-72">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 space-y-2">
              {isInitialLoading ? (
                <>
                  <div className="h-7 w-64 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-72 bg-muted rounded animate-pulse" />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </>
              ) : isEditing ? (
                <>
                  {/* Edit Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Garnnavn</Label>
                      <Input
                        id="edit-name"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Navn på garnet"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-producer">Produsent</Label>
                        <Input
                          id="edit-producer"
                          value={editData.producer}
                          onChange={(e) => setEditData(prev => ({ ...prev, producer: e.target.value }))}
                          placeholder="f.eks. Drops"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-weight">Garntykkelse</Label>
                        <Input
                          id="edit-weight"
                          value={editData.weight}
                          onChange={(e) => setEditData(prev => ({ ...prev, weight: e.target.value }))}
                          placeholder="f.eks. DK/Light worsted"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-composition">Sammensetning</Label>
                      <Input
                        id="edit-composition"
                        value={editData.composition}
                        onChange={(e) => setEditData(prev => ({ ...prev, composition: e.target.value }))}
                        placeholder="f.eks. 71% Alpakka, 25% Ull, 4% Polyamid"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="edit-yardage">Løpelengde (meter)</Label>
                        <Input
                          id="edit-yardage"
                          type="number"
                          value={editData.yardage}
                          onChange={(e) => setEditData(prev => ({ ...prev, yardage: e.target.value }))}
                          placeholder="175"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-needleSize">Pinner størrelse</Label>
                        <Input
                          id="edit-needleSize"
                          value={editData.needleSize}
                          onChange={(e) => setEditData(prev => ({ ...prev, needleSize: e.target.value }))}
                          placeholder="f.eks. 4-5 mm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-gauge">Strikkefasthet</Label>
                        <Input
                          id="edit-gauge"
                          value={editData.gauge}
                          onChange={(e) => setEditData(prev => ({ ...prev, gauge: e.target.value }))}
                          placeholder="f.eks. 20 m x 26 r"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-careInstructions">Vaskeråd</Label>
                      <Textarea
                        id="edit-careInstructions"
                        value={editData.careInstructions}
                        onChange={(e) => setEditData(prev => ({ ...prev, careInstructions: e.target.value }))}
                        placeholder="f.eks. Håndvask maks 30°C. Plantørking."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-imageUrl">Bilde URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-imageUrl"
                          value={editData.imageUrl}
                          onChange={(e) => setEditData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://..."
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Button type="button" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Last opp
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <div className="md:col-span-1">
              <div className="aspect-square w-full overflow-hidden rounded-md bg-muted md:w-56 md:h-56 md:mx-auto">
                {isInitialLoading ? (
                  <div className="h-full w-full bg-muted animate-pulse" />
                ) : (isEditing ? editData.imageUrl : master?.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={isEditing ? editData.imageUrl : master?.imageUrl} 
                    alt={isEditing ? editData.name : master?.name} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                    {isEditing ? (
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p>Last opp et bilde</p>
                      </div>
                    ) : (
                      'Ingen bilde'
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full">
                      <CheckCircle className="h-3 w-3 mr-1" /> Legg til batch
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Ny batch for {master?.name}{selectedColor ? ` – ${selectedColor}` : ''}</DialogTitle>
                      <DialogDescription>Fyll inn detaljer for batchen.</DialogDescription>
                    </DialogHeader>
                    <BatchCreator 
                      masterId={id}
                      onComplete={() => {
                        setIsAddBatchOpen(false)
                        utils.yarn.getBatchesForMaster.invalidate({ masterId: id })
                        utils.yarn.getMasterTotals.invalidate({ masterId: id })
                      }} 
                    />
                  </DialogContent>
                </Dialog>
                {batches && batches.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Bulk-operasjoner</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Bulk-operasjoner for batches</DialogTitle>
                      <DialogDescription>Endre mange batches i en operasjon.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                      <YarnBulkOperations 
                        items={batches || []}
                        itemType="batches"
                        onRefresh={() => {
                          utils.yarn.getBatchesForMaster.invalidate({ masterId: id })
                          utils.yarn.getMasterTotals.invalidate({ masterId: id })
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                )}
                {batches && batches.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Legg til prosjekt</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Legg batches til prosjekt</DialogTitle>
                      <DialogDescription>Velg hvilke batches som skal knyttes til prosjekt.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                      {(batches || []).map((b) => {
                        const d = b.categoryData ? JSON.parse(b.categoryData) : {}
                        return (
                          <YarnProjectIntegration
                            key={b.id}
                            batchId={b.id}
                            batchName={`${d.color || ''} - ${d.batchNumber || ''}`}
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

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Farger</h3>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground hidden md:block">Filter: {selectedColor || 'Ingen'}</div>
                <Dialog open={isAddColorsOpen} onOpenChange={setIsAddColorsOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> Legg til farger</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Legg til farger for {master?.name}</DialogTitle>
                      <DialogDescription>Registrer én eller flere farger. Fargekode og bilde-URL er valgfrie.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      {colorRows.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                          <div className="md:col-span-2">
                            <Label className="text-xs">Fargenavn</Label>
                            <Input value={row.name} onChange={(e) => updateRow(idx, 'name', e.target.value)} placeholder="f.eks. Hot Pink" />
                          </div>
                          <div>
                            <Label className="text-xs">Fargekode</Label>
                            <Input value={row.colorCode} onChange={(e) => updateRow(idx, 'colorCode', e.target.value)} placeholder="#FF69B4" />
                          </div>
                          <div>
                            <Label className="text-xs">Bilde-URL (valgfritt)</Label>
                            <Input value={row.imageUrl || ''} onChange={(e) => updateRow(idx, 'imageUrl', e.target.value)} placeholder="https://..." />
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => addRow()}><Plus className="h-3 w-3" /></Button>
                            {colorRows.length > 1 && (
                              <Button type="button" variant="outline" onClick={() => removeRow(idx)}><Trash2 className="h-3 w-3" /></Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsAddColorsOpen(false)}>Avbryt</Button>
                        <Button onClick={saveColors} className="bg-green-600 hover:bg-green-700">Lagre farger</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {isInitialLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 min-h-24">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : colors && colors.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {colors.map((c) => (
                  <div key={c.id} className={`group relative rounded-lg border transition-colors ${selectedColor === c.name ? 'bg-muted' : 'hover:bg-muted/40'}`}>
                    {editingColorId === c.id ? (
                      // Edit mode
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded overflow-hidden bg-muted border border-border/20">
                            {colorEditData.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={colorEditData.imageUrl} 
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div 
                                className="w-full h-full" 
                                style={{ backgroundColor: colorEditData.colorCode || '#e5e7eb' }}
                              />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">Redigerer</div>
                        </div>
                        
                        <Input
                          value={colorEditData.name}
                          onChange={(e) => setColorEditData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Fargenavn"
                          className="text-xs h-7"
                        />
                        
                        <Input
                          value={colorEditData.colorCode}
                          onChange={(e) => setColorEditData(prev => ({ ...prev, colorCode: e.target.value }))}
                          placeholder="Fargekode (f.eks. #FF0000)"
                          className="text-xs h-7"
                        />
                        
                        <Input
                          value={colorEditData.imageUrl}
                          onChange={(e) => setColorEditData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="Bilde URL"
                          className="text-xs h-7"
                        />
                        
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            onClick={saveColorChanges}
                            disabled={updateColor.isPending}
                            className="h-6 text-xs"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            {updateColor.isPending ? 'Lagrer...' : 'Lagre'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditingColor}
                            className="h-6 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Avbryt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <button 
                          onClick={() => {
                            const isActive = selectedColor === c.name
                            setSelectedColor(isActive ? '' : c.name)
                            setSelectedColorId(isActive ? '' : c.id)
                            setSelectedColorCode(isActive ? '' : (c as any).colorCode || '')
                          }} 
                          className="w-full p-3 text-left rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            {/* Color preview - image or color square */}
                            <div className="w-4 h-4 rounded overflow-hidden bg-muted border border-border/20">
                              {(c as any).imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                  src={(c as any).imageUrl} 
                                  alt={`Farge ${c.name}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div 
                                  className="w-full h-full" 
                                  style={{ backgroundColor: c.colorCode || '#e5e7eb' }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">
                                {c.name}
                                {c.colorCode && (
                                  <span className="text-xs text-muted-foreground ml-2">({c.colorCode})</span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                            <span>{c.batchCount} batches</span>
                            <span>{c.skeinCount} nøster</span>
                          </div>
                        </button>
                        
                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditingColor(c)
                            }}
                            className="p-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
                            title={`Rediger farge ${c.name}`}
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteColor(c.id, c.name)
                            }}
                            disabled={deleteColor.isPending}
                            className="p-1 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive"
                            title={`Slett farge ${c.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="min-h-10" />
            )}
          </div>

          <div className="mt-4">
            <BatchGrid masterId={id} hideMasterHeader hideTotals filterColorName={selectedColor || undefined} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


