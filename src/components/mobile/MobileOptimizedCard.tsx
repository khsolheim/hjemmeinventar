'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  ChevronRight, 
  MoreVertical, 
  Wifi, 
  WifiOff,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface MobileOptimizedCardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  swipeActions?: {
    left?: { icon: React.ReactNode; action: () => void; color: string }
    right?: { icon: React.ReactNode; action: () => void; color: string }
  }
  onTap?: () => void
  priority?: 'high' | 'normal' | 'low'
  offline?: boolean
  syncStatus?: 'synced' | 'pending' | 'failed' | 'syncing'
  hapticFeedback?: boolean
}

export function MobileOptimizedCard({
  children,
  className,
  interactive = false,
  swipeActions,
  onTap,
  priority = 'normal',
  offline = false,
  syncStatus,
  hapticFeedback = true,
  ...props
}: MobileOptimizedCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeActions) return
    
    const touch = e.touches[0]
    if (!touch) return
    startX.current = touch.clientX
    setIsSwipeActive(true)
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeActions || !isSwipeActive) return
    
    const touch = e.touches[0]
    if (!touch) return
    currentX.current = touch.clientX
    const deltaX = currentX.current - startX.current
    
    // Limit swipe distance
    const maxSwipe = 100
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
    setSwipeX(clampedDelta)
  }

  const handleTouchEnd = () => {
    if (!swipeActions || !isSwipeActive) return
    
    const deltaX = currentX.current - startX.current
    const threshold = 50
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && swipeActions.right) {
        swipeActions.right.action()
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate([50, 10, 50])
        }
      } else if (deltaX < 0 && swipeActions.left) {
        swipeActions.left.action()
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate([50, 10, 50])
        }
      }
    }
    
    // Reset swipe
    setSwipeX(0)
    setIsSwipeActive(false)
  }

  // Tap handlers with haptic feedback
  const handleTouchTap = () => {
    if (onTap) {
      setIsPressed(true)
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(20)
      }
      setTimeout(() => setIsPressed(false), 150)
      onTap()
    }
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Upload className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'syncing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getOfflineIndicator = () => {
    if (offline) {
      return <WifiOff className="w-4 h-4 text-gray-500" />
    }
    return <Wifi className="w-4 h-4 text-green-500" />
  }

  const getPriorityBorder = () => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500'
      case 'low':
        return 'border-l-4 border-l-gray-300'
      default:
        return ''
    }
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        'mobile-card transition-all duration-200 select-none',
        getPriorityBorder(),
        interactive && 'cursor-pointer',
        isPressed && 'scale-95 shadow-sm',
        swipeActions && 'touch-manipulation',
        className
      )}
      style={{
        transform: `translateX(${swipeX}px)`,
        transition: isSwipeActive ? 'none' : 'transform 0.3s ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleTouchTap}
      {...props}
    >
      {/* Swipe Actions Background */}
      {swipeActions && (
        <>
          {swipeActions.left && (
            <div 
              className={cn(
                'absolute inset-y-0 left-0 flex items-center justify-start pl-4 pointer-events-none',
                swipeActions.left.color
              )}
              style={{
                width: Math.max(0, -swipeX),
                opacity: Math.min(1, Math.abs(swipeX) / 50)
              }}
            >
              {swipeActions.left.icon}
            </div>
          )}
          
          {swipeActions.right && (
            <div 
              className={cn(
                'absolute inset-y-0 right-0 flex items-center justify-end pr-4 pointer-events-none',
                swipeActions.right.color
              )}
              style={{
                width: Math.max(0, swipeX),
                opacity: Math.min(1, swipeX / 50)
              }}
            >
              {swipeActions.right.icon}
            </div>
          )}
        </>
      )}

      {/* Card Content */}
      <div className="relative z-10 bg-background">
        <div className="flex items-start justify-between p-4">
          <div className="flex-1">
            {children}
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2 ml-4">
            {syncStatus && getSyncStatusIcon()}
            {getOfflineIndicator()}
            {interactive && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Specialized mobile card variants
export function MobileItemCard({
  item,
  onEdit,
  onDelete,
  onView,
  ...props
}: {
  item: any
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
} & Omit<MobileOptimizedCardProps, 'children' | 'swipeActions'>) {
  const swipeActions = {
    left: onDelete ? {
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      action: onDelete,
      color: 'bg-red-500'
    } : undefined,
    right: onEdit ? {
      icon: <MoreVertical className="w-6 h-6 text-white" />,
      action: onEdit,
      color: 'bg-blue-500'
    } : undefined
  }

  return (
    <MobileOptimizedCard
      swipeActions={swipeActions}
      onTap={onView}
      interactive={!!onView}
      {...props}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-base leading-tight">{item.name}</h3>
          <Badge variant="secondary" className="text-xs shrink-0 ml-2">
            {item.category?.name || 'Ukategoriserad'}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          📍 {item.location?.name || 'Ingen lokasjon'}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Antall: {item.totalQuantity || 0}
          </span>
          
          {item.expiryDate && (
            <span className="text-xs text-orange-600">
              Utløper: {new Date(item.expiryDate).toLocaleDateString('nb-NO')}
            </span>
          )}
        </div>
      </div>
    </MobileOptimizedCard>
  )
}

export function MobileLocationCard({
  location,
  onEdit,
  onDelete,
  onView,
  itemCount,
  ...props
}: {
  location: any
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  itemCount?: number
} & Omit<MobileOptimizedCardProps, 'children' | 'swipeActions'>) {
  const swipeActions = {
    left: onDelete ? {
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      action: onDelete,
      color: 'bg-red-500'
    } : undefined,
    right: onEdit ? {
      icon: <MoreVertical className="w-6 h-6 text-white" />,
      action: onEdit,
      color: 'bg-blue-500'
    } : undefined
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'ROOM': return '🏠'
      case 'SHELF': return '📚'
      case 'BOX': return '📦'
      case 'CONTAINER': return '🗃️'
      case 'DRAWER': return '🗄️'
      case 'CABINET': return '🗳️'
      default: return '📍'
    }
  }

  return (
    <MobileOptimizedCard
      swipeActions={swipeActions}
      onTap={onView}
      interactive={!!onView}
      {...props}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getLocationIcon(location.type)}</span>
            <h3 className="font-medium text-base leading-tight">{location.name}</h3>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 ml-2">
            {location.type}
          </Badge>
        </div>
        
        {location.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {location.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {itemCount !== undefined ? `${itemCount} gjenstander` : 'Ingen gjenstander'}
          </span>
          
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
            QR: {location.qrCode?.slice(-8)}
          </span>
        </div>
      </div>
    </MobileOptimizedCard>
  )
}

// CSS for line clamping (add to globals.css)
export const mobileCardStyles = `
.mobile-card {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
`
