import { type PrismaClient, RelationType } from '@prisma/client'
import { GarnBatchSchema, GarnMasterSchema, GarnColorSchema } from '@/lib/categories/category-schemas'

export class YarnService {
	private db: PrismaClient
	private userId: string

	constructor(db: PrismaClient, userId: string) {
		this.db = db
		this.userId = userId
	}

	async createMaster(input: {
		name: string
		locationId?: string
		imageUrl?: string
		categoryData: unknown
	}) {
		// 1. Validate input data
		const parsed = GarnMasterSchema.safeParse(input.categoryData)
		if (!parsed.success) {
			throw new Error(`Ugyldig garn data: ${parsed.error.errors.map(e => e.message).join(', ')}`)
		}

		// 2. Ensure category exists with auto-creation
		let masterCategory = await this.db.category.findFirst({ where: { name: 'Garn Master' } })
		if (!masterCategory) {
			console.warn('⚠️  Garn Master kategori mangler - oppretter automatisk')
			masterCategory = await this.createGarnMasterCategory()
		}

		// 3. Ensure location exists with auto-creation  
		let locationId = input.locationId
		if (!locationId) {
			let firstLocation = await this.db.location.findFirst({ where: { userId: this.userId }, orderBy: { name: 'asc' } })
			if (!firstLocation) {
				console.warn('⚠️  Ingen lokasjoner funnet - oppretter standard lokasjon')
				firstLocation = await this.createDefaultLocation()
			}
			locationId = firstLocation.id
		}

		const descriptionParts: string[] = []
		if (parsed.data.producer) descriptionParts.push(parsed.data.producer)
		if (parsed.data.composition) descriptionParts.push(parsed.data.composition)
		const description = descriptionParts.length > 0 ? descriptionParts.join(' - ') : undefined

		return await this.db.item.create({
			data: {
				name: input.name,
				description,
				userId: this.userId,
				categoryId: masterCategory.id,
				locationId,
				totalQuantity: 0,
				availableQuantity: 0,
				unit: 'type',
				imageUrl: input.imageUrl,
				categoryData: JSON.stringify(parsed.data)
			}
		})
	}

	async createBatch(input: {
		masterId: string
		name: string
		locationId: string
		imageUrl?: string
		unit?: string
		categoryData: unknown
		colorId?: string
	}) {
		const parsed = GarnBatchSchema.safeParse(input.categoryData)
		if (!parsed.success) {
			throw new Error(parsed.error.errors.map(e => e.message).join(', '))
		}

		const batchCategory = await this.db.category.findFirst({ where: { name: 'Garn Batch' } })
		if (!batchCategory) throw new Error('Garn Batch kategori ikke funnet')

		const data = parsed.data
		const batch = await this.db.item.create({
			data: {
				name: input.name,
				description: `Batch ${data.batchNumber} - ${data.color}`,
				userId: this.userId,
				categoryId: batchCategory.id,
				locationId: input.locationId,
				totalQuantity: Math.floor(data.quantity),
				availableQuantity: Number(data.quantity),
				unit: input.unit || 'nøste',
				price: data.pricePerSkein,
				purchaseDate: data.purchaseDate,
				imageUrl: input.imageUrl,
				categoryData: JSON.stringify({ ...data, masterItemId: input.masterId }),
				relatedItems: {
					connect: [
						{ id: input.masterId },
						...(input.colorId ? [{ id: input.colorId }] : [])
					]
				}
			}
		})

		// Typed relasjon: master -> batch (idempotent)
		try {
			await this.db.itemRelation.create({
				data: {
					relationType: RelationType.MASTER_OF,
					fromItemId: input.masterId,
					toItemId: batch.id,
					userId: this.userId
				}
			})
		} catch (e) {
			// Unikhetsbrudd er ok
		}

		// Typed relasjon: color -> batch (idempotent)
		if (input.colorId) {
			try {
				await this.db.itemRelation.create({
					data: {
						relationType: RelationType.BATCH_OF,
						fromItemId: input.colorId,
						toItemId: batch.id,
						userId: this.userId
					}
				})
			} catch (e) {}
		}

		return batch
	}

	async createColor(input: { masterId: string; name: string; colorCode?: string; imageUrl?: string }) {
		const master = await this.db.item.findFirst({ where: { id: input.masterId, userId: this.userId } })
		if (!master) throw new Error('Master ikke funnet')

		let colorCategory = await this.db.category.findFirst({ where: { name: 'Garn Farge' } })
		if (!colorCategory) {
			colorCategory = await this.db.category.create({
				data: {
					name: 'Garn Farge',
					description: 'Fargenivå mellom master og batch',
					fieldSchema: JSON.stringify({ type: 'object', properties: { colorCode: { type: 'string', label: 'Fargekode' }, masterItemId: { type: 'string', label: 'Master', hidden: true } } })
				}
			})
		}

		const payload = { colorCode: input.colorCode, masterItemId: input.masterId }
		const parsed = GarnColorSchema.safeParse(payload)
		if (!parsed.success) {
			throw new Error(parsed.error.errors.map(e => e.message).join(', '))
		}

		const color = await this.db.item.create({
			data: {
				name: input.name,
				userId: this.userId,
				categoryId: colorCategory.id,
				locationId: master.locationId,
				totalQuantity: 0,
				availableQuantity: 0,
				unit: 'nøste',
				imageUrl: input.imageUrl,
				categoryData: JSON.stringify(parsed.data),
				relatedItems: { connect: { id: input.masterId } }
			}
		})

		// Typed relasjon: master -> color (idempotent)
		try {
			await this.db.itemRelation.create({
				data: {
					relationType: RelationType.COLOR_OF,
					fromItemId: input.masterId,
					toItemId: color.id,
					userId: this.userId
				}
			})
		} catch (e) {}

		return color
	}

	// **AUTO-CREATION HELPERS** 🛡️
	private async createGarnMasterCategory() {
		return await this.db.category.create({
			data: {
				name: 'Garn Master',
				description: 'Master-kategori for garntyper (auto-opprettet)',
				icon: '🧶',
				fieldSchema: JSON.stringify({
					type: 'object',
					properties: {
						fiberContent: { type: 'string', title: 'Fiberinnhold' },
						weight: { type: 'string', title: 'Garntykkelse' },
						yardage: { type: 'number', title: 'Lengde (meter)' },
						gauge: { type: 'string', title: 'Strikkefasthet' },
						needleSize: { type: 'string', title: 'Pinner størrelse' },
						careInstructions: { type: 'string', title: 'Vaskeinstruksjoner' },
						brand: { type: 'string', title: 'Merke' },
						colorway: { type: 'string', title: 'Fargenavn' },
						lotNumber: { type: 'string', title: 'Partinummer' }
					},
					required: ['fiberContent', 'weight']
				})
			}
		})
	}

	private async createDefaultLocation() {
		return await this.db.location.create({
			data: {
				name: 'Hovedlager',
				description: 'Standard oppbevaringslokasjon (auto-opprettet)',
				type: 'ROOM',
				qrCode: `location-${this.userId}-main-${Date.now()}`,
				userId: this.userId
			}
		})
	}
}