import { auth } from '@/auth'
import { db } from '@/lib/db'
import { calculateMasterTotals } from '@/lib/utils/yarn-helpers'
import { YarnMasterDetail } from '@/components/yarn/YarnMasterDetail'

export default async function YarnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  let initialMaster: any = undefined
  let initialTotals: any = undefined
  let initialColors: Array<{ id: string, name: string, colorCode?: string, batchCount: number, skeinCount: number }> | undefined = undefined

  if (userId) {
    initialMaster = await db.item.findFirst({
      where: { id, userId },
    })

    try {
      initialTotals = await calculateMasterTotals(db as any, id, userId)
    } catch {}

    try {
      const colorCategory = await db.category.findFirst({ where: { name: 'Garn Farge' } })
      const batchCategory = await db.category.findFirst({ where: { name: 'Garn Batch' } })
      if (colorCategory) {
        const colors = await db.item.findMany({
          where: {
            userId,
            categoryId: colorCategory.id,
            OR: [
               { relatedItems: { some: { id } } },
               { relatedTo: { some: { id } } }
            ]
          }
        })
        const results: Array<{ id: string, name: string, colorCode?: string, batchCount: number, skeinCount: number }> = []
        if (batchCategory) {
          for (const color of colors) {
            const batches = await db.item.findMany({
              where: {
                userId,
                categoryId: batchCategory.id,
                OR: [
                  { relatedItems: { some: { id: color.id } } },
                  { relatedTo: { some: { id: color.id } } }
                ]
              }
            })
            const skeins = batches.reduce((sum, b) => {
              const qty = Number(b.availableQuantity || 0)
              return sum + qty
            }, 0)
            const colorData = color.categoryData ? JSON.parse(color.categoryData) : {}
            results.push({
              id: color.id,
              name: color.name,
              colorCode: colorData.colorCode,
              batchCount: batches.length,
              skeinCount: Math.round(skeins)
            })
          }
        }
        initialColors = results
      }
    } catch {}
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      <YarnMasterDetail id={id} initialMaster={initialMaster} initialTotals={initialTotals} initialColors={initialColors} />
    </div>
  )
}


