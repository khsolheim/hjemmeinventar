// Accessibility-enhanced button component
import { forwardRef } from 'react'
import { Button, ButtonProps } from './button'

interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string
  'aria-describedby'?: string
  loading?: boolean
  loadingText?: string
  children?: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    loading, 
    loadingText = 'Laster...', 
    'aria-label': ariaLabel, 
    ...props 
  }, ref) => (
    <Button
      aria-label={loading ? `${ariaLabel} - ${loadingText}` : ariaLabel}
      aria-busy={loading}
      aria-disabled={loading || props.disabled}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="sr-only">{loadingText}</span>
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  )
)

AccessibleButton.displayName = 'AccessibleButton'

export { AccessibleButton }
