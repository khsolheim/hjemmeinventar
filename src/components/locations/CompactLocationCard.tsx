'use client'

import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  QrCode, 
  Edit2, 
  Trash2,
  Home,
  Package,
  Archive,
  Folder,
  FileText,
  Layers,
  ShoppingBag,
  Square,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const locationTypeIcons = {
  ROOM: Home,
  SHELF: Package,
  BOX: Archive,
  CONTAINER: Package,
  DRAWER: Folder,
  CABINET: FileText,
  SHELF_COMPARTMENT: Layers,
  BAG: ShoppingBag,
  SECTION: Square
}

const locationTypeLabels = {
  ROOM: 'Rom',
  SHELF: 'Reol',
  BOX: 'Boks',
  CONTAINER: 'Beholder',
  DRAWER: 'Skuff',
  CABINET: 'Skap',
  SHELF_COMPARTMENT: 'Hylle',
  BAG: 'Pose',
  SECTION: 'Avsnitt'
}

interface CompactLocationCardProps {
  location: any
  onEdit: (location: any) => void
  onDelete: (id: string) => void
  onShowQR: (qrCode: string) => void
  onSelect?: (id: string, selected: boolean) => void
  isSelected?: boolean
  isSelectionMode?: boolean
}

export function CompactLocationCard({
  location,
  onEdit,
  onDelete,
  onShowQR,
  onSelect,
  isSelected = false,
  isSelectionMode = false
}: CompactLocationCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  const isDragging = useRef<boolean>(false)

  const Icon = locationTypeIcons[location.type as keyof typeof locationTypeIcons] || MapPin

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSelectionMode) return
    
    const touch = e.touches[0]
    if (!touch) return
    startX.current = touch.clientX
    startY.current = touch.clientY
    isDragging.current = false
    setIsSwipeActive(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSelectionMode || !isSwipeActive) return
    
    const touch = e.touches[0]
    if (!touch) return
    const deltaX = touch.clientX - startX.current
    const deltaY = touch.clientY - startY.current
    
    // Only consider horizontal swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return
    }
    
    // Prevent vertical scrolling while swiping horizontally
    if (Math.abs(deltaX) > 10) {
      e.preventDefault()
      isDragging.current = true
    }
    
    // Limit swipe distance
    const maxSwipe = 120
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
    
    setSwipeOffset(clampedDelta)
    setSwipeDirection(clampedDelta > 0 ? 'right' : 'left')
  }

  const handleTouchEnd = () => {
    if (isSelectionMode || !isSwipeActive) return
    
    const threshold = 60
    
    if (Math.abs(swipeOffset) > threshold && isDragging.current) {
      // Trigger action based on swipe direction
      if (swipeDirection === 'right') {
        // Swipe right = Edit
        onEdit(location)
        
        // Haptic feedback if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      } else if (swipeDirection === 'left') {
        // Swipe left = Delete
        onDelete(location.id)
        
        // Haptic feedback if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50])
        }
      }
    }
    
    // Reset swipe state
    setSwipeOffset(0)
    setSwipeDirection(null)
    setIsSwipeActive(false)
    isDragging.current = false
  }

  // Mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSelectionMode) return
    
    startX.current = e.clientX
    startY.current = e.clientY
    setIsSwipeActive(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelectionMode || !isSwipeActive) return
    
    const deltaX = e.clientX - startX.current
    const maxSwipe = 120
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
    
    setSwipeOffset(clampedDelta)
    setSwipeDirection(clampedDelta > 0 ? 'right' : 'left')
  }

  const handleMouseUp = () => {
    if (isSelectionMode || !isSwipeActive) return
    
    const threshold = 60
    
    if (Math.abs(swipeOffset) > threshold) {
      if (swipeDirection === 'right') {
        onEdit(location)
      } else if (swipeDirection === 'left') {
        onDelete(location.id)
      }
    }
    
    setSwipeOffset(0)
    setSwipeDirection(null)
    setIsSwipeActive(false)
  }

  const handleCardClick = () => {
    if (isSelectionMode && onSelect) {
      onSelect(location.id, !isSelected)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background action indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-4 bg-green-500 text-white">
        <div className="flex items-center gap-2">
          <Edit2 className="w-5 h-5" />
          <span className="font-medium">Rediger</span>
        </div>
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          <span className="font-medium">Slett</span>
        </div>
      </div>
      
      {/* Main card */}
      <div
        ref={cardRef}
        className={`relative bg-white border rounded-lg transition-transform duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        } ${isSelectionMode ? 'cursor-pointer' : ''}`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          backgroundColor: swipeDirection === 'right' ? 'rgba(34, 197, 94, 0.1)' : 
                          swipeDirection === 'left' ? 'rgba(239, 68, 68, 0.1)' : 
                          isSelected ? 'rgb(239 246 255)' : 'white'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCardClick}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Selection checkbox or icon */}
              {isSelectionMode ? (
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ) : (
                <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{location.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {locationTypeLabels[location.type as keyof typeof locationTypeLabels]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {location._count?.items || 0} ting
                  </span>
                  {location.children?.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      • {location.children.length} under
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!isSelectionMode && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onShowQR(location.qrCode)
                    }}
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-8 h-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(location)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Rediger
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(location.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Slett
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              
              {location.parent && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Description if present */}
          {location.description && !isSelectionMode && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {location.description}
            </p>
          )}

          {/* Hierarchy breadcrumb */}
          {location.parent && !isSelectionMode && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <span>I: {location.parent.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Swipe instruction overlay */}
      {swipeOffset !== 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className={`px-3 py-1 rounded text-xs font-medium ${
            swipeDirection === 'right' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {swipeDirection === 'right' ? 'Slipp for å redigere' : 'Slipp for å slette'}
          </div>
        </div>
      )}
    </div>
  )
}
