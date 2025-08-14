import { auth } from '@/auth'
import { db } from '@/lib/db'
import { CategoriesPageClient } from '@/components/categories/CategoriesPageClient'

// Category Field Schema Viewer Component
function FieldSchemaViewer({ schema, categoryName }: { schema: any; categoryName: string }) {
  if (!schema || !schema.properties) {
    return (
      <div className="text-sm text-muted-foreground">
        Ingen spesielle felter definert for denne kategorien
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Spesielle felter for {categoryName}:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(schema.properties).map(([key, field]: [string, any]) => (
          <div key={key} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
            <span className="font-medium">{field.label || key}</span>
            <Badge variant="outline" className="text-xs">
              {field.type === 'select' ? 'Valg' : field.type}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function CategoriesPage() {
  const session = await auth()
  const userId = session?.user?.id
  let initialCategories: any[] | undefined
  if (userId) {
    initialCategories = await db.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { items: true } }
      }
    })
  }
  return <CategoriesPageClient initialCategories={initialCategories} />
}
