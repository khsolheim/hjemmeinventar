import { auth } from '@/auth'
import { db } from '@/lib/db'
import { calculateMasterTotals } from '@/lib/utils/yarn-helpers'
import { serializeItemForClient, serializeItemsForClient } from '@/lib/utils/decimal-serializer'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const YarnMasterDetail = dynamic(() => import('@/components/yarn/YarnMasterDetail').then(mod => ({ default: mod.YarnMasterDetail })), {
  loading: () => <div className="flex items-center justify-center p-8 text-muted-foreground">Laster garn detaljer...</div>
})

export default async function YarnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  let initialMaster: any = undefined
  let initialTotals: any = undefined
  let initialColors: Array<{ id: string, name: string, colorCode?: string, batchCount: number, skeinCount: number }> | undefined = undefined

  if (userId) {
    const master = await db.item.findFirst({
      where: { id, userId },
    })
    initialMaster = master ? serializeItemForClient(master) : undefined

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
                   { itemRelationsFrom: { some: { toItemId: id } } },
                   { itemRelationsTo: { some: { fromItemId: id } } }
                ]
              }
            })
            const serializedColors = serializeItemsForClient(colors)
        const results: Array<{ id: string, name: string, colorCode?: string, batchCount: number, skeinCount: number }> = []
        if (batchCategory) {
          for (const color of serializedColors) {
            const batches = await db.item.findMany({
              where: {
                userId,
                categoryId: batchCategory.id,
                OR: [
                  { itemRelationsFrom: { some: { toItemId: color.id } } },
                  { itemRelationsTo: { some: { fromItemId: color.id } } }
                ]
              }
            })
            const serializedBatches = serializeItemsForClient(batches)
            const skeins = serializedBatches.reduce((sum, b) => {
              const qty = Number(b.availableQuantity || 0)
              return sum + qty
            }, 0)
            const colorData = color.categoryData as any || {}
            results.push({
              id: color.id,
              name: color.name,
              colorCode: colorData.colorCode,
              batchCount: serializedBatches.length,
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
      <YarnMasterDetail 
        id={id} 
        initialMaster={initialMaster} 
        initialTotals={initialTotals} 
        {...(initialColors && { initialColors })} 
      />
    </div>
  )
}


