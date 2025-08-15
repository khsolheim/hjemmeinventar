import { type PrismaClient } from '@prisma/client'
import { GarnBatchSchema, GarnMasterSchema } from '@/lib/categories/category-schemas'

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
		const parsed = GarnMasterSchema.safeParse(input.categoryData)
		if (!parsed.success) {
			throw new Error(parsed.error.errors.map(e => e.message).join(', '))
		}

		const masterCategory = await this.db.category.findFirst({ where: { name: 'Garn Master' } })
		if (!masterCategory) throw new Error('Garn Master kategori ikke funnet')

		let locationId = input.locationId
		if (!locationId) {
			const firstLocation = await this.db.location.findFirst({ where: { userId: this.userId }, orderBy: { name: 'asc' } })
			if (!firstLocation) throw new Error('Ingen lokasjoner tilgjengelige')
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
	}) {
		const parsed = GarnBatchSchema.safeParse(input.categoryData)
		if (!parsed.success) {
			throw new Error(parsed.error.errors.map(e => e.message).join(', '))
		}

		const batchCategory = await this.db.category.findFirst({ where: { name: 'Garn Batch' } })
		if (!batchCategory) throw new Error('Garn Batch kategori ikke funnet')

		const data = parsed.data
		return await this.db.item.create({
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
				relatedItems: { connect: { id: input.masterId } }
			}
		})
	}
}
