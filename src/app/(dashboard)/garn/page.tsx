import { YarnMasterDashboard, type YarnMasterWithTotals } from '@/components/yarn/YarnMasterDashboard'
import { db } from '@/lib/db'
import { calculateMasterTotals } from '@/lib/utils/yarn-helpers'
import { auth } from '@/auth'

export default async function GarnPage() {
  const session = await auth()
  let initialMasters: YarnMasterWithTotals[] | undefined
  let initialTotal: number | undefined
  if (session?.user?.id) {
    const masterCategory = await db.category.findFirst({ where: { name: 'Garn Master' } })
    if (masterCategory) {
      const masters = await db.item.findMany({
        where: { userId: session.user.id, categoryId: masterCategory.id },
        include: { location: true, category: true, relatedTo: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      })
      const withTotals: YarnMasterWithTotals[] = []
      for (const m of masters) {
        const totals = await calculateMasterTotals(db, m.id, session.user.id)
        withTotals.push({
          id: m.id,
          name: m.name,
          description: m.description,
          categoryData: m.categoryData,
          location: { id: m.locationId!, name: m.location?.name || '' },
          totals,
          createdAt: m.createdAt,
        } as any)
      }
      initialMasters = withTotals
      initialTotal = await db.item.count({ where: { userId: session.user.id, categoryId: masterCategory.id } })
    }
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      <YarnMasterDashboard initialMasters={initialMasters} initialTotal={initialTotal} />
    </div>
  )
}
