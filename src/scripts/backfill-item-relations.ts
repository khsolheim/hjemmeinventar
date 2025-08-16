import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userIds = await prisma.user.findMany({ select: { id: true } })
  let created = 0

  for (const { id: userId } of userIds) {
    const [masterCategory, batchCategory, colorCategory] = await Promise.all([
      prisma.category.findFirst({ where: { name: 'Garn Master' } }),
      prisma.category.findFirst({ where: { name: 'Garn Batch' } }),
      prisma.category.findFirst({ where: { name: 'Garn Farge' } })
    ])

    if (!masterCategory || !batchCategory) continue

    // Master -> Batch
    const masters = await prisma.item.findMany({ where: { userId, categoryId: masterCategory.id }, select: { id: true } })
    for (const m of masters) {
      const batches = await prisma.item.findMany({
        where: {
          userId,
          categoryId: batchCategory.id,
          OR: [
            { relatedItems: { some: { id: m.id } } },
            { relatedTo: { some: { id: m.id } } },
            { categoryData: { contains: `"masterItemId":"${m.id}"` } }
          ]
        },
        select: { id: true }
      })
      for (const b of batches) {
        try {
          await prisma.itemRelation.create({
            data: { relationType: 'MASTER_OF', fromItemId: m.id, toItemId: b.id, userId }
          })
          created++
        } catch {}
      }
    }

    // Color -> Batch (valgfritt hvis fargekategori finnes)
    if (colorCategory) {
      const colors = await prisma.item.findMany({ where: { userId, categoryId: colorCategory.id }, select: { id: true } })
      for (const c of colors) {
        const colorBatches = await prisma.item.findMany({
          where: {
            userId,
            categoryId: batchCategory.id,
            OR: [
              { relatedItems: { some: { id: c.id } } },
              { relatedTo: { some: { id: c.id } } }
            ]
          },
          select: { id: true }
        })
        for (const b of colorBatches) {
          try {
            await prisma.itemRelation.create({
              data: { relationType: 'BATCH_OF', fromItemId: c.id, toItemId: b.id, userId }
            })
            created++
          } catch {}
        }
      }
    }
  }

  console.log(`Backfill fullført. Opprettet ${created} typed relasjoner.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
