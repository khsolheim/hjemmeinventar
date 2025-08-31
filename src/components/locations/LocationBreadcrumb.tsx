'use client'

import { ChevronRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BreadcrumbItem {
  id: string | null
  name: string
  icon?: React.ComponentType<{ className?: string }>
}

interface LocationBreadcrumbProps {
  items: BreadcrumbItem[]
  onNavigate: (locationId: string | null) => void
}

export function LocationBreadcrumb({ items, onNavigate }: LocationBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const Icon = item.icon || Home
        
        return (
          <div key={item.id || 'root'} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}
            
            {isLast ? (
              <span className="flex items-center font-medium text-foreground">
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 font-normal hover:bg-muted"
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            )}
          </div>
        )
      })}
    </nav>
  )
}
