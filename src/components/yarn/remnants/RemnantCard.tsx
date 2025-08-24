'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  MapPin, 
  Package, 
  Calendar,
  ExternalLink,
  Scissors
} from 'lucide-react'
import { format } from 'date-fns'

interface RemnantData {
  originalBatchId: string
  originalColor: string
  originalColorCode?: string
  condition: 'Excellent' | 'Good' | 'Fair' | 'Tangled' | 'Needs sorting'
  sourceProject?: string
  sourceProjectId?: string
  createdFrom: 'project_completion' | 'manual_entry' | 'batch_split' | 'leftover'
  originalProducer?: string
  originalComposition?: string
  notes?: string
}

interface RemnantCardProps {
  remnant: {
    id: string
    name: string
    description?: string | null
    availableQuantity: number
    unit: string
    categoryData?: string | null
    createdAt: Date
    location?: {
      name: string
    }
    itemRelationsFrom?: Array<{
      toItem: {
        id: string
        name: string
        category?: {
          name: string
        }
      }
    }>
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onUseInProject?: (id: string) => void
  onViewOriginal?: (id: string) => void
}

const conditionColors = {
  'Excellent': 'bg-green-500',
  'Good': 'bg-blue-500', 
  'Fair': 'bg-yellow-500',
  'Tangled': 'bg-orange-500',
  'Needs sorting': 'bg-red-500'
}

const conditionLabels = {
  'Excellent': 'Utmerket',
  'Good': 'God',
  'Fair': 'OK',
  'Tangled': 'Floket',
  'Needs sorting': 'Trenger sortering'
}

export function RemnantCard({ 
  remnant, 
  onEdit, 
  onDelete, 
  onUseInProject,
  onViewOriginal 
}: RemnantCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const remnantData: RemnantData | null = remnant.categoryData 
    ? typeof remnant.categoryData === 'string' 
      ? JSON.parse(remnant.categoryData) 
      : remnant.categoryData
    : null

  const originalBatch = remnant.itemRelationsFrom?.[0]?.toItem

  const handleAction = async (action: () => void) => {
    setIsLoading(true)
    try {
      await action()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{remnant.name}</h3>
              {remnantData?.condition && (
                <Badge 
                  variant="secondary" 
                  className={`text-white ${conditionColors[remnantData.condition]}`}
                >
                  {conditionLabels[remnantData.condition]}
                </Badge>
              )}
            </div>
            
            {remnantData?.originalColor && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {remnantData.originalColorCode && (
                  <div 
                    className="w-4 h-4 rounded border border-gray-300" 
                    style={{ backgroundColor: remnantData.originalColorCode }}
                  />
                )}
                <span>{remnantData.originalColor}</span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onUseInProject && (
                <DropdownMenuItem 
                  onClick={() => handleAction(() => onUseInProject(remnant.id))}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Bruk i prosjekt
                </DropdownMenuItem>
              )}
              {originalBatch && onViewOriginal && (
                <DropdownMenuItem 
                  onClick={() => handleAction(() => onViewOriginal(originalBatch.id))}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Se original batch
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem 
                  onClick={() => handleAction(() => onEdit(remnant.id))}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Rediger
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => handleAction(() => onDelete(remnant.id))}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Slett
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Amount Display */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-primary">
            {remnant.availableQuantity}{remnant.unit}
          </div>
          <div className="text-sm text-muted-foreground">
            Tilgjengelig mengde
          </div>
        </div>

        {/* Original Yarn Info */}
        {remnantData && (
          <div className="space-y-2 mb-4">
            {remnantData.originalProducer && (
              <div className="text-sm">
                <span className="text-muted-foreground">Produsent:</span>{' '}
                <span className="font-medium">{remnantData.originalProducer}</span>
              </div>
            )}
            {remnantData.originalComposition && (
              <div className="text-sm">
                <span className="text-muted-foreground">Sammensetning:</span>{' '}
                <span className="font-medium">{remnantData.originalComposition}</span>
              </div>
            )}
            {remnantData.sourceProject && (
              <div className="text-sm">
                <span className="text-muted-foreground">Fra prosjekt:</span>{' '}
                <span className="font-medium">{remnantData.sourceProject}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {remnantData?.notes && (
          <div className="text-sm text-muted-foreground mb-4 p-2 bg-muted rounded">
            {remnantData.notes}
          </div>
        )}

        {/* Location */}
        {remnant.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{remnant.location.name}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Opprettet {format(new Date(remnant.createdAt), 'dd.MM.yyyy')}</span>
        </div>
      </CardFooter>
    </Card>
  )
}