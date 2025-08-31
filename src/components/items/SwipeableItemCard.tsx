'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  MapPin,
  Tag,
  Edit,
  Trash2,
  Move,
  Package,
  CheckSquare,
  Square
} from 'lucide-react'

interface SwipeableItemCardProps {
  item: any
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onEdit?: () => void
  onDelete?: () => void
  onMove?: () => void
  showSelection?: boolean
  className?: string
}

export function SwipeableItemCard({
  item,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onMove,
  showSelection = false,
  className = ''
}: SwipeableItemCardProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showSelection || showActions) return // Don't swipe if in selection mode

    const touch = e.touches[0]
    if (!touch) return
    startX.current = touch.clientX
    setIsSwipeActive(true)

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive || showSelection) return

    const touch = e.touches[0]
    if (!touch) return
    currentX.current = touch.clientX
    const deltaX = currentX.current - startX.current

    // Limit swipe distance
    const maxSwipe = 120
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
    setSwipeX(clampedDelta)

    // Show actions if swiped far enough
    setShowActions(Math.abs(clampedDelta) > 50)
  }

  const handleTouchEnd = () => {
    if (!isSwipeActive || showSelection) return

    const deltaX = currentX.current - startX.current
    const threshold = 50

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onEdit) {
        // Swipe right = edit
        onEdit()
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 10, 50])
        }
      } else if (deltaX < 0 && onDelete) {
        // Swipe left = delete (with confirmation)
        if (window.confirm(`Slett "${item.name}"?`)) {
          onDelete()
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100])
          }
        }
      }
    }

    // Reset swipe
    setSwipeX(0)
    setIsSwipeActive(false)
    setShowActions(false)
  }

  const handleSelectionChange = (checked: boolean) => {
    onSelect?.(checked)
    // Haptic feedback for selection
    if ('vibrate' in navigator) {
      navigator.vibrate(checked ? 30 : 20)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Swipe Actions Background */}
      <div className="absolute inset-y-0 left-0 right-0 flex">
        {/* Left Action (Edit) */}
        <div className="flex-1 bg-blue-500 flex items-center justify-start pl-4">
          <Edit className="w-5 h-5 text-white" />
        </div>

        {/* Right Action (Delete) */}
        <div className="flex-1 bg-red-500 flex items-center justify-end pr-4">
          <Trash2 className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Main Card */}
      <Card
        ref={cardRef}
        className={`transition-all duration-200 select-none ${
          showSelection ? 'cursor-pointer' : 'touch-manipulation'
        } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwipeActive ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Selection Checkbox */}
            {showSelection && (
              <div className="pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleSelectionChange}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
            )}

            {/* Item Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-base leading-tight truncate">
                  {item.name}
                </h3>

                {/* Category Badge */}
                {item.category && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {item.category.name}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {/* Location */}
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{item.location.name}</span>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>{item.availableQuantity} {item.unit}</span>
                </div>

                {/* Expiry Date */}
                {item.expiryDate && (
                  <div className={`flex items-center gap-1 ${
                    new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      ? 'text-orange-600'
                      : ''
                  }`}>
                    <span>📅</span>
                    <span>{new Date(item.expiryDate).toLocaleDateString('no-NO', {
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (when not in selection mode) */}
            {!showSelection && (
              <div className="flex items-center gap-1 shrink-0">
                {onMove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove()
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Move className="w-4 h-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Swipe Hint (for first-time users) */}
      {!showSelection && !isSwipeActive && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground opacity-60">
          ← Sveip for handlinger →
        </div>
      )}
    </div>
  )
}

// Compact version for lists
export function CompactItemCard({
  item,
  isSelected = false,
  onSelect,
  onClick,
  className = ''
}: {
  item: any
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'bg-primary/5 border-primary' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelect(checked as boolean)
            if ('vibrate' in navigator) {
              navigator.vibrate(checked ? 30 : 20)
            }
          }}
          className="shrink-0"
        />
      )}

      {/* Item Icon/Category */}
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-sm">
          {item.category?.icon || '📦'}
        </span>
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{item.name}</h4>
          {item.category && (
            <Badge variant="outline" className="text-xs">
              {item.category.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.location.name}
            </span>
          )}
          <span>{item.availableQuantity} {item.unit}</span>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <CheckSquare className="w-5 h-5 text-primary shrink-0" />
      )}
    </div>
  )
}
