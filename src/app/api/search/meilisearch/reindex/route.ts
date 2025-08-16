import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { meilisearchService } from '@/lib/search/meilisearch-service'

function isAdmin(user: any): boolean {
	return user.role === 'admin' || user.email === 'admin@hjemmeinventar.no'
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth()
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		if (!isAdmin(session.user)) {
			return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
		}

		const users = await db.user.findMany({ select: { id: true } })
		let totalDocs = 0
		for (const u of users) {
			const [items, locations, categories] = await Promise.all([
				db.item.findMany({ where: { userId: u.id }, include: { category: true, location: true, tags: true } }),
				db.location.findMany({ where: { userId: u.id }, include: { parent: true } }),
				db.category.findMany({ include: { _count: { select: { items: true } } } })
			])

			await meilisearchService.reindexUserData(u.id, { items, locations, categories })
			// Rough estimate of docs sent
			totalDocs += items.length + locations.length + categories.length
		}

		return NextResponse.json({ success: true, users: users.length, estimatedDocs: totalDocs })
	} catch (error) {
		console.error('Reindex error:', error)
		return NextResponse.json({ error: 'Reindex failed' }, { status: 500 })
	}
}
