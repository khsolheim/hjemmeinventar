'use client'

import { useEffect, useMemo, useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Selection =
	| { level: 'master'; id: string }
	| { level: 'color'; id: string; masterId: string }
	| { level: 'batch'; id: string; masterId: string; colorId?: string }
	| null

export function YarnManager() {
	const [search, setSearch] = useState('')
	const [selection, setSelection] = useState<Selection>(null)
	const [openColorMasterId, setOpenColorMasterId] = useState<string | null>(null)
	const [openBatchContext, setOpenBatchContext] = useState<{ masterId: string; colorId?: string } | null>(null)

	const utils = trpc.useUtils()
	const { data: mastersData } = trpc.yarn.getAllMasters.useQuery({ limit: 50, offset: 0, search: search || undefined })

	const masters = mastersData?.masters ?? []

	const refetchAll = async () => {
		await Promise.all([
			utils.yarn.getAllMasters.invalidate(),
			utils.yarn.getAllMasterColors.invalidate(),
		])
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
			{/* Kolonne 1: Master */}
			<div className="md:col-span-3 space-y-2">
				<div className="flex gap-2">
					<Input placeholder="Søk master..." value={search} onChange={(e) => setSearch(e.target.value)} />
					<Button size="sm" onClick={() => setSelection({ level: 'master', id: 'new' })}>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				<div className="space-y-1 max-h-[70vh] overflow-auto">
					{masters.map((m: any) => (
						<Card key={m.id} className={`p-2 cursor-pointer ${selection?.level === 'master' && selection.id === m.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelection({ level: 'master', id: m.id })}>
							<div className="flex items-center justify-between">
								<div className="truncate">
									<div className="font-medium truncate">{m.name}</div>
									<div className="text-xs text-muted-foreground">{m.location?.name}</div>
								</div>
								<div className="text-xs text-muted-foreground">{m.totals?.batchCount ?? 0} batches</div>
							</div>
						</Card>
					))}
				</div>
			</div>

			{/* Kolonne 2: Farger og Batches for valgt master */}
			<div className="md:col-span-4 space-y-2">
				{selection?.level && (selection.level === 'master' || selection.level === 'color' || selection.level === 'batch') ? (
					<MasterColorsAndBatches 
						masterId={selection.level === 'master' ? selection.id : selection.masterId} 
						onSelect={(sel) => setSelection(sel)}
						onOpenColor={() => setOpenColorMasterId(selection.level === 'master' ? selection.id : selection.masterId)}
						onOpenBatch={(ctx) => setOpenBatchContext(ctx)}
					/>
				) : (
					<div className="text-sm text-muted-foreground p-2">Velg en master for å se farger og batches</div>
				)}
			</div>

			{/* Kolonne 3: Detaljpanel */}
			<div className="md:col-span-5">
				<DetailPanel selection={selection} onChange={refetchAll} onSelect={setSelection} masters={masters} />
			</div>

			{/* Modal: Opprett farge */}
			<CreateColorDialog 
				masterId={openColorMasterId}
				onOpenChange={(open) => { if (!open) setOpenColorMasterId(null) }}
				onCreated={() => { 
					toast.success('Farge opprettet')
					Promise.all([
						utils.yarn.getColorsForMaster.invalidate(),
						utils.yarn.getAllMasterColors.invalidate(),
					])
				}}
			/>

			{/* Modal: Opprett batch */}
			<CreateBatchDialog 
				context={openBatchContext}
				onOpenChange={(open) => { if (!open) setOpenBatchContext(null) }}
				onCreated={() => {
					toast.success('Batch opprettet')
					Promise.all([
						utils.yarn.getBatchesForMaster.invalidate(),
					])
				}}
			/>
		</div>
	)
}

function MasterColorsAndBatches({ masterId, onSelect, onOpenColor, onOpenBatch }: { masterId: string; onSelect: (s: Selection) => void; onOpenColor: () => void; onOpenBatch: (ctx: { masterId: string; colorId?: string }) => void }) {
	const { data: colors } = trpc.yarn.getColorsForMaster.useQuery({ masterId })
	const { data: batches } = trpc.yarn.getBatchesForMaster.useQuery({ masterId })

	const byColor = useMemo(() => {
		const map = new Map<string, any>()
		;(colors || []).forEach((c: any) => map.set(c.id, { color: c, batches: [] as any[] }))
		;(batches || []).forEach((b: any) => {
			const relColor = (b.relatedItems || []).concat(b.relatedTo || []).find((r: any) => r.category?.name === 'Garn Farge')
			const colorId = relColor?.id
			if (colorId && map.has(colorId)) map.get(colorId)!.batches.push(b)
		})
		return map
	}, [colors, batches])

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="font-medium">Farger</div>
				<Button size="sm" onClick={onOpenColor}>
					<Plus className="h-4 w-4" />
				</Button>
			</div>
			<div className="space-y-2 max-h-[70vh] overflow-auto">
				{Array.from(byColor.values()).length === 0 && (
					<Card className="p-2 text-xs text-muted-foreground">Ingen farger registrert. Klikk + for å legge til første farge.</Card>
				)}
				{Array.from(byColor.values()).map(({ color, batches }) => (
					<Card key={color.id} className="p-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 rounded border" style={{ backgroundColor: color.colorCode || '#ddd' }} />
								<div className="font-medium cursor-pointer" onClick={() => onSelect({ level: 'color', id: color.id, masterId })}>{color.name}</div>
							</div>
							<Button size="icon" variant="ghost" onClick={() => onOpenBatch({ masterId, colorId: color.id })}>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="mt-2 space-y-1">
							{batches.length === 0 ? (
								<div className="text-xs text-muted-foreground">Ingen batches</div>
							) : (
								batches.map((b: any) => (
									<div key={b.id} className="flex items-center justify-between p-1 rounded hover:bg-muted/50">
										<div className="cursor-pointer" onClick={() => onSelect({ level: 'batch', id: b.id, masterId, colorId: color.id })}>
											<div className="text-sm font-medium">{b.name}</div>
											<div className="text-xs text-muted-foreground">Tilgjengelig: {b.availableQuantity}</div>
										</div>
									</div>
								))
							)}
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}

function DetailPanel({ selection, onChange, onSelect, masters }: { selection: Selection; onChange: () => void; onSelect: (s: Selection) => void; masters: any[] }) {
	const utils = trpc.useUtils()

	// Lokale felt for nye skjemaer
	const [newColorName, setNewColorName] = useState('')
	const [newColorCode, setNewColorCode] = useState('')
	const [newBatchNumber, setNewBatchNumber] = useState('')
	const [newBatchQty, setNewBatchQty] = useState('')
	const [newBatchPrice, setNewBatchPrice] = useState('')

	useEffect(() => {
		// Reset når valg endres
		setNewColorName('')
		setNewColorCode('')
		setNewBatchNumber('')
		setNewBatchQty('')
		setNewBatchPrice('')
	}, [selection?.level, selection && 'id' in selection ? (selection as any).id : null])

	// Mutasjoner
	const updateMaster = trpc.yarn.updateMaster.useMutation({ onSuccess: () => { utils.yarn.getAllMasters.invalidate(); onChange() } })
	const deleteMaster = trpc.yarn.deleteMaster.useMutation({ onSuccess: () => { utils.yarn.getAllMasters.invalidate(); onChange() } })
	const updateColor = trpc.yarn.updateColor.useMutation({ onSuccess: () => { utils.yarn.getColorsForMaster.invalidate(); onChange() } })
	const deleteColor = trpc.yarn.deleteColor.useMutation({ onSuccess: () => { utils.yarn.getColorsForMaster.invalidate(); onChange() } })
	const updateBatch = trpc.yarn.updateBatch.useMutation({ onSuccess: () => { utils.yarn.getBatchesForMaster.invalidate(); onChange() } })
	const deleteBatch = trpc.yarn.deleteBatch.useMutation({ onSuccess: () => { utils.yarn.getBatchesForMaster.invalidate(); onChange() } })
	const adjustQty = trpc.yarn.adjustBatchQuantity.useMutation({ onSuccess: () => { utils.yarn.getBatchesForMaster.invalidate(); onChange() } })
	const createColor = trpc.yarn.createColor.useMutation({
		onSuccess: (color) => {
			utils.yarn.getColorsForMaster.invalidate()
			onChange()
			toast.success('Farge opprettet')
			// Velg ny farge
			if (selection && selection.level === 'color' && selection.id === 'new') {
				onSelect({ level: 'color', id: color.id, masterId: selection.masterId })
			}
		},
		onError: (err: any) => {
			const code = err?.data?.code
			if (code === 'CONFLICT') toast.error('Fargen finnes allerede')
			else toast.error('Kunne ikke opprette farge')
		}
	})
	const createBatch = trpc.yarn.createBatch.useMutation({
		onSuccess: () => {
			utils.yarn.getBatchesForMaster.invalidate()
			onChange()
			toast.success('Batch opprettet')
			// Gå til visning av master etter opprettelse
			if (selection && selection.level === 'batch' && selection.id === 'new') {
				onSelect({ level: 'master', id: selection.masterId })
			}
		},
		onError: (err: any) => {
			const code = err?.data?.code
			if (code === 'CONFLICT') toast.error('Batch finnes allerede for valgt farge og partinummer')
			else toast.error('Kunne ikke opprette batch')
		}
	})

	if (!selection) return <div className="text-sm text-muted-foreground p-2">Velg en node for å redigere</div>

	if (selection.level === 'master') {
		if (selection.id === 'new') {
			return <div className="text-sm text-muted-foreground">Opprett ny master i veiviseren (Registrer Garn)</div>
		}
		return (
			<div className="space-y-2">
				<div className="font-medium">Rediger master</div>
				<div className="grid grid-cols-2 gap-2">
					<Input placeholder="Navn" onBlur={(e) => updateMaster.mutate({ id: selection.id, name: e.target.value })} />
					<Input placeholder="Produsent" onBlur={(e) => updateMaster.mutate({ id: selection.id, producer: e.target.value })} />
					<Input placeholder="Sammensetning" onBlur={(e) => updateMaster.mutate({ id: selection.id, composition: e.target.value })} />
				</div>
				<div className="flex gap-2">
					<Button variant="destructive" size="sm" onClick={() => deleteMaster.mutate({ id: selection.id })}>
						<Trash2 className="h-4 w-4 mr-1" /> Slett master
					</Button>
				</div>
			</div>
		)
	}

	if (selection.level === 'color') {
		if (selection.id === 'new') {
			const newName = ''
			const newCode = ''
			return (
				<div className="space-y-2">
					<div className="font-medium">Ny farge</div>
					<div className="grid grid-cols-2 gap-2">
						<Input placeholder="Navn" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} />
						<Input placeholder="Fargekode (valgfritt)" value={newColorCode} onChange={(e) => setNewColorCode(e.target.value)} />
					</div>
					<div className="flex gap-2">
						<Button size="sm" disabled={createColor.isPending} onClick={() => {
							if (!newColorName.trim()) { toast.error('Fargenavn er påkrevd'); return }
							createColor.mutate({ masterId: selection.masterId, name: newColorName.trim(), colorCode: newColorCode || undefined })
						}}>
							{createColor.isPending ? 'Oppretter…' : 'Opprett'}
						</Button>
						<Button size="sm" variant="ghost" onClick={() => onSelect({ level: 'master', id: selection.masterId })}>Avbryt</Button>
					</div>
				</div>
			)
		}
		return (
			<div className="space-y-2">
				<div className="font-medium">Rediger farge</div>
				<div className="grid grid-cols-2 gap-2">
					<Input placeholder="Navn" onBlur={(e) => updateColor.mutate({ colorId: selection.id, name: e.target.value })} />
					<Input placeholder="Fargekode" onBlur={(e) => updateColor.mutate({ colorId: selection.id, colorCode: e.target.value })} />
				</div>
				<div className="flex gap-2">
					<Button variant="destructive" size="sm" onClick={() => deleteColor.mutate({ colorId: selection.id })}>
						<Trash2 className="h-4 w-4 mr-1" /> Slett farge
					</Button>
				</div>
			</div>
		)
	}

	if (selection.level === 'batch') {
		if (selection.id === 'new') {
			const bn = ''
			const qty = ''
			const price = ''
			const master = masters.find((m) => m.id === selection.masterId)
			const locationId = master?.location?.id
			return (
				<div className="space-y-2">
					<div className="font-medium">Ny batch</div>
					<div className="grid grid-cols-3 gap-2">
						<Input placeholder="Partinr" value={newBatchNumber} onChange={(e) => setNewBatchNumber(e.target.value)} />
						<Input placeholder="Antall" type="number" value={newBatchQty} onChange={(e) => setNewBatchQty(e.target.value)} />
						<Input placeholder="Pris/nøste (valgfritt)" type="number" step="0.01" value={newBatchPrice} onChange={(e) => setNewBatchPrice(e.target.value)} />
					</div>
					<div className="flex gap-2">
						<Button size="sm" disabled={createBatch.isPending} onClick={() => {
							if (!newBatchNumber.trim()) { toast.error('Partinummer er påkrevd'); return }
							const q = Number(newBatchQty || 0)
							if (!Number.isFinite(q) || q < 1) { toast.error('Antall må være minst 1'); return }
							if (!locationId) { toast.error('Mangler lokasjon for master'); return }
							createBatch.mutate({
								masterId: selection.masterId,
								name: `${newBatchNumber}`,
								locationId,
								batchNumber: newBatchNumber.trim(),
								color: '',
								quantity: q,
								pricePerSkein: newBatchPrice ? Number(newBatchPrice) : undefined,
								unit: 'nøste',
								colorId: selection.colorId,
							})
						}}>
							{createBatch.isPending ? 'Oppretter…' : 'Opprett'}
						</Button>
						<Button size="sm" variant="ghost" onClick={() => onSelect({ level: 'color', id: selection.colorId || 'new', masterId: selection.masterId })}>Avbryt</Button>
					</div>
				</div>
			)
		}
		return (
			<div className="space-y-2">
				<div className="font-medium">Rediger batch</div>
				<div className="grid grid-cols-2 gap-2">
					<Input placeholder="Navn" onBlur={(e) => updateBatch.mutate({ batchId: selection.id, name: e.target.value })} />
					<Input placeholder="Partinummer" onBlur={(e) => updateBatch.mutate({ batchId: selection.id, batchNumber: e.target.value })} />
					<Input placeholder="Antall" type="number" onBlur={(e) => updateBatch.mutate({ batchId: selection.id, quantity: Number(e.target.value || 0) })} />
					<Input placeholder="Pris per nøste" type="number" step="0.01" onBlur={(e) => updateBatch.mutate({ batchId: selection.id, pricePerSkein: Number(e.target.value || 0) })} />
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={() => adjustQty.mutate({ batchId: selection.id, delta: 1, reason: 'COUNT' })}>+1</Button>
					<Button size="sm" onClick={() => adjustQty.mutate({ batchId: selection.id, delta: -1, reason: 'COUNT' })}>-1</Button>
					<Button variant="destructive" size="sm" onClick={() => deleteBatch.mutate({ batchId: selection.id })}>
						<Trash2 className="h-4 w-4 mr-1" /> Slett batch
					</Button>
				</div>
			</div>
		)
	}

	return null
}

function CreateColorDialog({ masterId, onOpenChange, onCreated }: { masterId: string | null; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [code, setCode] = useState('')
	const createColor = trpc.yarn.createColor.useMutation()

	useEffect(() => {
		if (masterId) { setOpen(true) }
		else { setOpen(false) }
	}, [masterId])

	return (
		<Dialog open={open} onOpenChange={(o) => { setOpen(o); onOpenChange(o) }}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ny farge</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-2 gap-2">
					<Input placeholder="Navn" value={name} onChange={(e) => setName(e.target.value)} />
					<Input placeholder="Fargekode (valgfritt)" value={code} onChange={(e) => setCode(e.target.value)} />
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={() => setOpen(false)}>Avbryt</Button>
					<Button onClick={async () => {
						if (!masterId) return
						if (!name.trim()) { toast.error('Fargenavn er påkrevd'); return }
						try {
							await createColor.mutateAsync({ masterId, name: name.trim(), colorCode: code || undefined })
							onCreated()
							setOpen(false)
							setName(''); setCode('')
						} catch (e: any) {
							if (e?.data?.code === 'CONFLICT') toast.error('Fargen finnes allerede')
							else toast.error('Kunne ikke opprette farge')
						}
					}}>
						Opprett
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function CreateBatchDialog({ context, onOpenChange, onCreated }: { context: { masterId: string; colorId?: string } | null; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
	const [open, setOpen] = useState(false)
	const [batchNumber, setBatchNumber] = useState('')
	const [qty, setQty] = useState('')
	const [price, setPrice] = useState('')
	const [locationId, setLocationId] = useState<string>('')
	const createBatch = trpc.yarn.createBatch.useMutation()
	const { data: locations } = trpc.locations.getAllFlat.useQuery(undefined, { staleTime: 0, gcTime: 0 })

	useEffect(() => {
		if (context) { setOpen(true) } else { setOpen(false) }
	}, [context])

	useEffect(() => {
		// Default lokasjon: første i listen
		if (!locationId && locations && locations.length > 0) {
			setLocationId(locations[0].id)
		}
	}, [locations, locationId])

	return (
		<Dialog open={open} onOpenChange={(o) => { setOpen(o); onOpenChange(o) }}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ny batch</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-3 gap-2">
					<Input placeholder="Partinr" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
					<Input placeholder="Antall" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
					<Input placeholder="Pris/nøste (valgfritt)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
				</div>
				<div className="grid grid-cols-1 gap-2 mt-2">
					<label className="text-xs text-muted-foreground">Lokasjon</label>
					<select className="h-9 border rounded px-2" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
						{(locations || []).map((l: any) => (
							<option key={l.id} value={l.id}>{l.name}</option>
						))}
					</select>
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={() => setOpen(false)}>Avbryt</Button>
					<Button onClick={async () => {
						if (!context) return
						if (!batchNumber.trim()) { toast.error('Partinummer er påkrevd'); return }
						const q = Number(qty || 0)
						if (!Number.isFinite(q) || q < 1) { toast.error('Antall må være minst 1'); return }
						if (!locationId) { toast.error('Velg lokasjon'); return }
						try {
							await createBatch.mutateAsync({
								masterId: context.masterId,
								name: `${batchNumber}`,
								locationId,
								batchNumber: batchNumber.trim(),
								color: '',
								quantity: q,
								pricePerSkein: price ? Number(price) : undefined,
								unit: 'nøste',
								colorId: context.colorId,
							})
							onCreated()
							setOpen(false)
							setBatchNumber(''); setQty(''); setPrice('')
						} catch (e: any) {
							if (e?.data?.code === 'CONFLICT') toast.error('Batch finnes allerede for valgt farge og partinummer')
							else toast.error('Kunne ikke opprette batch')
						}
					}}>
						Opprett
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}


