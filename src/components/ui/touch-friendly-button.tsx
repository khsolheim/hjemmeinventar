'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "./button"

export interface TouchFriendlyButtonProps extends ButtonProps {
  children?: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onLongPress?: () => void
  hapticFeedback?: boolean
  loading?: boolean
  loadingText?: string
  longPress?: boolean
  icon?: React.ReactNode
  primary?: boolean
  danger?: boolean
  success?: boolean
  disabled?: boolean
  className?: string
}

export interface TouchIconButtonProps {
  icon: React.ReactNode
  'aria-label': string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}

export interface TouchFloatingButtonProps extends TouchFriendlyButtonProps {
  position?: "bottom-right" | "bottom-left" | "bottom-center"
  offset?: number
  className?: string
}

const TouchFriendlyButton = React.forwardRef<HTMLButtonElement, TouchFriendlyButtonProps>(
  ({ 
    children, 
    onClick,
    onLongPress,
    hapticFeedback = false,
    loading = false,
    loadingText = "Laster...",
    longPress = false,
    icon,
    primary = false,
    danger = false,
    success = false,
    className,
    disabled,
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false)
    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)

    const handleTouchStart = () => {
      setIsPressed(true)
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate([10])
      }
      
      if (longPress && onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress()
          if (hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(20)
          }
        }, 500)
      }
    }

    const handleTouchEnd = () => {
      setIsPressed(false)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!longPress && onClick) {
        onClick(event)
      }
    }

    const getVariant = () => {
      if (danger) return "destructive"
      if (success) return "default"
      if (primary) return "default"
      return "outline"
    }

    return (
      <Button
        variant={getVariant()}
        className={cn(
          "touch-manipulation min-h-[44px] min-w-[44px] active:scale-95 transition-transform",
          isPressed && "scale-95",
          primary && "bg-primary text-primary-foreground",
          success && "bg-green-600 text-white hover:bg-green-700",
          danger && "bg-red-600 text-white hover:bg-red-700",
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            {loadingText}
          </>
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </Button>
    )
  }
)

TouchFriendlyButton.displayName = "TouchFriendlyButton"

const TouchIconButton = React.forwardRef<HTMLButtonElement, TouchIconButtonProps>(
  ({ icon, 'aria-label': ariaLabel, onClick, className, ...props }, ref) => {
    return (
      <TouchFriendlyButton
        ref={ref}
        aria-label={ariaLabel}
        onClick={onClick}
        className={cn("p-3", className)}
        {...props}
      >
        {icon}
      </TouchFriendlyButton>
    )
  }
)

TouchIconButton.displayName = "TouchIconButton"

const TouchFloatingButton = React.forwardRef<HTMLButtonElement, TouchFloatingButtonProps>(
  ({ 
    position = "bottom-right", 
    offset = 20,
    className,
    ...props 
  }, ref) => {
    const positionClasses = {
      "bottom-right": `fixed bottom-${offset} right-${offset}`,
      "bottom-left": `fixed bottom-${offset} left-${offset}`,
      "bottom-center": `fixed bottom-${offset} left-1/2 transform -translate-x-1/2`
    }

    return (
      <TouchFriendlyButton
        ref={ref}
        className={cn(
          "rounded-full shadow-lg z-50",
          positionClasses[position],
          className
        )}
        {...props}
      />
    )
  }
)

TouchFloatingButton.displayName = "TouchFloatingButton"

export { TouchFriendlyButton, TouchIconButton, TouchFloatingButton }
