import { auth } from '@/auth'
import { db } from '@/lib/db'
import { CategoryDetailClient } from '@/components/categories/CategoryDetailClient'

export default async function CategoryDetailPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const session = await auth()
  const userId = session?.user?.id
  const resolvedParams = await params
  const categoryId = resolvedParams.categoryId

  let initialCategory: any = null
  let initialItems: any = undefined
  let initialTotal: number | undefined
  let initialTotalValue: number | undefined

  if (userId) {
    initialCategory = await db.category.findFirst({ where: { id: categoryId } })
    const items = await db.item.findMany({
      where: { userId, categoryId },
      include: { location: true, tags: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      skip: 0,
    })
    const total = await db.item.count({ where: { userId, categoryId } })
    initialItems = { items, total }
    initialTotal = total
    initialTotalValue = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
  }

  return (
    <CategoryDetailClient 
      categoryId={categoryId}
      initialCategory={initialCategory}
      initialItems={initialItems}
      {...(initialTotal !== undefined && { initialTotal })}
      {...(initialTotalValue !== undefined && { initialTotalValue })}
    />
  )
}


