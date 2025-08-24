'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BatchData {
  id: string
  name: string
  totalQuantity: number
  availableQuantity: number
  imageUrl?: string
  purchaseDate?: Date
  categoryData?: string
}

interface CompactBatchCardProps {
  color: string
  colorCode?: string
  batches: BatchData[]
  onEdit?: (batchId: string) => void
  onDelete?: (batchId: string, name: string) => void
  colorImage?: string
}

// Helper function to parse batch category data
function getBatchData(categoryData?: any) {
  if (!categoryData) return {}
  
  // If it's already an object, return it directly
  if (typeof categoryData === 'object') {
    return categoryData
  }
  
  // If it's a string, try to parse it as JSON
  if (typeof categoryData === 'string') {
    try {
      return JSON.parse(categoryData)
    } catch {
      return {}
    }
  }
  
  return {}
}

export function CompactBatchCard({ 
  color, 
  colorCode, 
  batches, 
  onEdit, 
  onDelete,
  colorImage 
}: CompactBatchCardProps) {
  const router = useRouter()

  // Kalkuler totaler
  const totalQuantity = batches.reduce((sum, batch) => {
    const data = getBatchData(batch.categoryData)
    return sum + (data.quantity || batch.totalQuantity || 0)
  }, 0)

  const totalAvailable = batches.reduce((sum, batch) => {
    const data = getBatchData(batch.categoryData)
    const reserved = Number(data.reserved || 0)
    return sum + Math.max((batch.availableQuantity || 0) - reserved, 0)
  }, 0)

  // Hvis bare én batch, gå direkte til den
  const handleCardClick = (e: React.MouseEvent) => {
    const el = e.target as HTMLElement
    if (el.closest('button') || el.closest('a') || el.closest('input') || el.closest('label') || el.closest('[role="button"]')) {
      return
    }
    
    if (batches.length === 1 && batches[0]) {
      router.push(`/garn/batch/${batches[0].id}`)
    }
    // For flere batches, la kortet være klikkbart men ikke navigere automatisk
  }

  const colorStyle = colorCode 
    ? { backgroundColor: colorCode }
    : undefined

  return (
    <Card 
      className="relative cursor-pointer hover:ring-1 hover:ring-muted"
      onClick={handleCardClick}
    >
      <CardHeader className="px-3 py-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {colorImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={colorImage} 
                alt={color} 
                className="h-8 w-8 rounded object-cover" 
              />
            )}
            <div className="text-sm font-semibold">
              {batches.length > 1 && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-2">
                  {batches.length} batches
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            {batches.length === 1 && (
              <>
                <Link href={`/garn/batch/${batches[0]?.id}`} className="inline-flex">
                  <Button variant="ghost" size="sm" title="Åpne detaljer">
                    <QrCode className="h-3 w-3" />
                  </Button>
                </Link>
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (batches[0]?.id) {
                        onEdit(batches[0].id)
                      }
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (batches[0]?.id && batches[0]?.name) {
                        onDelete(batches[0].id, batches[0].name)
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 py-2 space-y-2">
        {/* Fargeinformasjon */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            {colorStyle && (
              <div 
                className="w-3 h-3 rounded-full border border-gray-300" 
                style={colorStyle}
              />
            )}
            <span>{color}</span>
          </div>
          {colorCode && (
            <div className="font-semibold text-xs font-mono truncate">{colorCode}</div>
          )}
        </div>

        {/* Batch-numre */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Batch-numre:</div>
          <div className="text-xs font-mono">
            {batches.map((batch, index) => {
              const batchData = getBatchData(batch.categoryData)
              return (
                <span key={batch.id}>
                  {batchData.batchNumber || `B${index + 1}`}
                  {index < batches.length - 1 && ', '}
                </span>
              )
            })}
          </div>
        </div>

        {/* Individuelle antall */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Antall per batch:</div>
          <div className="text-xs">
            {batches.map((batch, index) => {
              const batchData = getBatchData(batch.categoryData)
              const reserved = Number(batchData.reserved || 0)
              const available = Math.max((batch.availableQuantity || 0) - reserved, 0)
              const total = batchData.quantity || batch.totalQuantity || 0
              
              return (
                <div key={batch.id} className="flex justify-between">
                  <span>
                    {batches.length > 1 && `${batchData.batchNumber || `B${index + 1}`}: `}
                  </span>
                  <span className="font-medium">{available}/{total}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Total sammendrag */}
        <div className="border-t pt-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Total</span>
            <span className="font-bold">{totalAvailable}/{totalQuantity} nøster</span>
          </div>
        </div>

        {/* Samlet fremdriftsstolpe */}
        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${
                totalAvailable === totalQuantity ? 'bg-green-500' :
                totalAvailable === 0 ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ 
                width: `${totalQuantity > 0 ? Math.round((totalAvailable / totalQuantity) * 100) : 0}%` 
              }}
            />
          </div>
        </div>

        {/* Individuelle batch-lenker hvis flere batches */}
        {batches.length > 1 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-1">Åpne enkelt batch:</div>
            <div className="flex flex-wrap gap-1">
              {batches.map((batch, index) => {
                const batchData = getBatchData(batch.categoryData)
                return (
                  <Link key={batch.id} href={`/garn/batch/${batch.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {batchData.batchNumber || `B${index + 1}`}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
