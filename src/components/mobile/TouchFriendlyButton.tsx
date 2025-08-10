'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface TouchFriendlyButtonProps extends ButtonProps {
  hapticFeedback?: boolean
  longPress?: boolean
  longPressDelay?: number
  onLongPress?: () => void
  loading?: boolean
  touchScale?: boolean
  preventDoubleClick?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export function TouchFriendlyButton({
  children,
  className,
  hapticFeedback = true,
  longPress = false,
  longPressDelay = 500,
  onLongPress,
  onClick,
  loading = false,
  touchScale = true,
  preventDoubleClick = true,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}: TouchFriendlyButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)
  
  const longPressTimer = useRef<NodeJS.Timeout>()
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback || !('vibrate' in navigator)) return
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    }
    
    navigator.vibrate(patterns[type])
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || loading) return
    
    setIsPressed(true)
    triggerHapticFeedback('light')
    
    if (longPress && onLongPress) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true)
        triggerHapticFeedback('heavy')
        onLongPress()
      }, longPressDelay)
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    setIsLongPressing(false)
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleTouchCancel = () => {
    setIsPressed(false)
    setIsLongPressing(false)
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    
    // Prevent double clicks
    if (preventDoubleClick) {
      const now = Date.now()
      if (now - lastClickTime < 300) {
        e.preventDefault()
        return
      }
      setLastClickTime(now)
    }

    // Don't trigger onClick if it was a long press
    if (isLongPressing) {
      e.preventDefault()
      return
    }

    triggerHapticFeedback('medium')
    onClick?.(e)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {children && <span className="ml-2">{children}</span>}
        </>
      )
    }

    if (icon && children) {
      return iconPosition === 'left' ? (
        <>
          {icon}
          <span className="ml-2">{children}</span>
        </>
      ) : (
        <>
          <span className="mr-2">{children}</span>
          {icon}
        </>
      )
    }

    return icon || children
  }

  return (
    <Button
      ref={buttonRef}
      className={cn(
        'touch-friendly-button select-none transition-all duration-150',
        touchScale && isPressed && 'scale-95',
        isLongPressing && 'ring-2 ring-primary ring-offset-2',
        longPress && 'relative',
        // Minimum touch target size (44px)
        'min-h-[44px] min-w-[44px]',
        // Better touch targets on mobile
        'px-6 py-3 text-base',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
      
      {/* Long press indicator */}
      {longPress && isPressed && (
        <div 
          className="absolute inset-0 rounded-md bg-primary/20 animate-pulse"
          style={{
            animation: `longPressIndicator ${longPressDelay}ms linear forwards`
          }}
        />
      )}
    </Button>
  )
}

// Specialized touch button variants
export function TouchIconButton({
  icon,
  'aria-label': ariaLabel,
  ...props
}: {
  icon: React.ReactNode
  'aria-label': string
} & Omit<TouchFriendlyButtonProps, 'children' | 'icon'>) {
  return (
    <TouchFriendlyButton
      variant="ghost"
      size="icon"
      className="w-12 h-12 rounded-full"
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </TouchFriendlyButton>
  )
}

export function TouchActionButton({
  primary = false,
  danger = false,
  success = false,
  ...props
}: {
  primary?: boolean
  danger?: boolean
  success?: boolean
} & TouchFriendlyButtonProps) {
  const getVariant = () => {
    if (danger) return 'destructive'
    if (primary) return 'default'
    if (success) return 'default'
    return 'outline'
  }

  const getClassName = () => {
    if (success) return 'bg-green-600 hover:bg-green-700 text-white'
    return ''
  }

  return (
    <TouchFriendlyButton
      variant={getVariant()}
      className={cn(
        'font-semibold',
        getClassName()
      )}
      hapticFeedback={true}
      touchScale={true}
      {...props}
    />
  )
}

export function TouchFloatingActionButton({
  position = 'bottom-right',
  offset = 20,
  ...props
}: {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  offset?: number
} & TouchFriendlyButtonProps) {
  const getPositionStyles = () => {
    const base = `fixed z-50 rounded-full shadow-lg`
    
    switch (position) {
      case 'bottom-right':
        return `${base} bottom-${offset} right-${offset}`
      case 'bottom-left':
        return `${base} bottom-${offset} left-${offset}`
      case 'bottom-center':
        return `${base} bottom-${offset} left-1/2 transform -translate-x-1/2`
      default:
        return `${base} bottom-${offset} right-${offset}`
    }
  }

  return (
    <TouchFriendlyButton
      size="lg"
      className={cn(
        'w-14 h-14 rounded-full',
        getPositionStyles()
      )}
      hapticFeedback={true}
      touchScale={true}
      {...props}
    />
  )
}

// CSS animations for long press indicator
export const touchButtonStyles = `
@keyframes longPressIndicator {
  from {
    transform: scale(0);
    opacity: 0.3;
  }
  to {
    transform: scale(1);
    opacity: 0.1;
  }
}

.touch-friendly-button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
}

/* Better touch targets for mobile */
@media (max-width: 768px) {
  .touch-friendly-button {
    min-height: 44px;
    padding: 12px 16px;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .touch-friendly-button {
    font-weight: 500;
  }
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .touch-friendly-button {
    transition: none;
  }
  
  .touch-friendly-button * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`
