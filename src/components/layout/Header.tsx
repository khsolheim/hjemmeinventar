'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  User,
  Settings,
  LogOut,
  Plus,
  Shield
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { MeilisearchBox } from '@/components/search/MeilisearchBox'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true
      })
    } catch (error) {
      console.error('Feil ved utlogging:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="md:hidden"
          aria-label="Åpne sidemeny"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Mobile Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2 md:hidden">
          <span className="text-2xl">🏠</span>
          <span className="font-bold">Hjemmeinventar</span>
        </Link>

        {/* Flexible spacer */}
        <div className="flex-1" />

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block w-64">
            <MeilisearchBox 
              placeholder="Søk i inventar..."
              className="w-full"
            />
          </div>

          {/* Quick Add Button */}
          <Button size="sm" className="hidden sm:flex" asChild>
            <Link href="/items/enhanced" aria-label="Legg til ny gjenstand">
              <Plus className="h-4 w-4 mr-2" />
              Legg til
            </Link>
          </Button>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full"
                aria-label="Brukermeny"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || 'Bruker'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || 'Ikke innlogget'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Innstillinger</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logg ut</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
