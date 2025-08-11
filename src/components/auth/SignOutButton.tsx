'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function SignOutButton({ 
  variant = 'destructive', 
  size = 'default',
  className,
  showIcon = true,
  children
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  const handleSignOut = async () => {
    setIsLoading(true)
    
    try {
      toast.loading('Logger ut...', { id: 'signout' })
      
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true
      })
      
      toast.success('Du er nå logget ut', { id: 'signout' })
    } catch (error) {
      console.error('Feil ved utlogging:', error)
      toast.error('Kunne ikke logge ut. Prøv igjen.', { id: 'signout' })
      setIsLoading(false)
    }
  }

  // Ikke vis knappen hvis ikke logget inn
  if (!session) {
    return null
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
      aria-label="Logg ut fra kontoen"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        showIcon && <LogOut className="h-4 w-4 mr-2" />
      )}
      {children || 'Logg ut'}
    </Button>
  )
}
