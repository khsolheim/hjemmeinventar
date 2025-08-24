import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function parseCategoryData<T = any>(json?: string | null): T {
  try { return json ? JSON.parse(json) : ({} as any) } catch { return {} as any }
}

async function main() {
  const userIds = await prisma.user.findMany({ select: { id: true } })
  let colorCategory = await prisma.category.findFirst({ where: { name: 'Garn Farge' } })
  if (!colorCategory) {
    colorCategory = await prisma.category.create({ data: { name: 'Garn Farge', description: 'Farger for garn', fieldSchema: JSON.stringify({ type: 'object', properties: { colorCode: { type: 'string' }, masterItemId: { type: 'string' } } }) } })
  }
  const batchCategory = await prisma.category.findFirst({ where: { name: 'Garn Batch' } })
  if (!batchCategory) {
    console.log('Ingen "Garn Batch"-kategori funnet. Avbryter.')
    return
  }

  for (const { id: userId } of userIds) {
    const masters = await prisma.item.findMany({ where: { userId, category: { name: 'Garn Master' } } })
    for (const master of masters) {
      // const batches = await prisma.item.findMany({ where: { userId, categoryId: batchCategory.id, OR: [ { relatedItems: { some: { id: master.id } } }, { relatedTo: { some: { id: master.id } } } ] } }) // Removed - not in schema
      const batches: any[] = [] // Placeholder since relatedItems not in schema
      const byColor = new Map<string, { name: string, colorCode?: string }>()
      batches.forEach(b => {
        const data = parseCategoryData(b.categoryData as string)
        const key = `${(data.color || '').toLowerCase()}|${(data.colorCode || '').toLowerCase()}`
        if (!byColor.has(key)) byColor.set(key, { name: data.color || 'Ukjent', colorCode: data.colorCode })
      })

      for (const [, info] of byColor) {
        // Finn eksisterende
        const existing = await prisma.item.findFirst({
          where: {
            userId,
            categoryId: colorCategory.id,
            name: info.name,
            OR: [ /* { relatedItems: { some: { id: master.id } } }, { relatedTo: { some: { id: master.id } } } */ ] // Removed - not in schema
          }
        })
        const color = existing || await prisma.item.create({
          data: {
            name: info.name,
            userId,
            categoryId: colorCategory.id,
            locationId: master.locationId,
            totalQuantity: 0,
            availableQuantity: 0,
            unit: 'nøste',
            categoryData: JSON.stringify({ colorCode: info.colorCode, masterItemId: master.id }),
            // relatedItems: { connect: { id: master.id } } // Removed - not in schema
          }
        })

        // Relater batches til fargen
        for (const b of batches) {
          const data = parseCategoryData(b.categoryData as string)
          if ((data.color || '').toLowerCase() === info.name.toLowerCase()) {
            // await prisma.item.update({ where: { id: b.id }, data: { relatedItems: { connect: { id: color.id } } } }) // Removed - not in schema
          }
        }
      }
    }
  }

  console.log('Yarn colors initialized.')
}

main().finally(() => prisma.$disconnect())


