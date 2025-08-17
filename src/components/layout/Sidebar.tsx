'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChevronLeft,
  ChevronRight,
  Home, 
  Package, 
  MapPin, 
  QrCode,
  User,
  Settings,
  LogOut,
  Plus,
  Grid3x3,
  BarChart3,
  UserCheck,
  FileText,
  Shield,
  Users,
  Activity,
  Smartphone,
  Brain,
  Database,
  Menu,
  X,
  Palette,
  Printer
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

export function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Gjenstander', href: '/items', icon: Package },
    { name: 'Garn', href: '/garn', icon: Palette },
    { name: 'Lokasjoner', href: '/locations', icon: MapPin },
    { name: 'Kategorier', href: '/categories', icon: Grid3x3 },
    { name: 'Printing', href: '/printing', icon: Printer },
    { name: 'Husholdninger', href: '/households', icon: Users },
    { name: 'Samarbeid', href: '/collaboration', icon: Activity },
    { name: 'AI-Funksjoner', href: '/ai', icon: Brain },
    { name: 'Import/Export', href: '/import-export', icon: Database },
    { name: 'Mobile', href: '/mobile', icon: Smartphone },
    { name: 'Mønstre', href: '/patterns', icon: FileText },
    { name: 'Utlån', href: '/loans', icon: UserCheck },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Skann QR', href: '/scan', icon: QrCode },
  ]
  
  const pathname = usePathname()

  // For mobile: overlay sidebar
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden" 
            onClick={onToggle}
          />
        )}
        
        {/* Mobile sidebar */}
        <div className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 bg-background border-r transform transition-transform duration-200 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="flex items-center space-x-2" onClick={onToggle}>
              <span className="text-2xl">🏠</span>
              <div className="flex flex-col">
                <span className="font-bold text-lg">HMS</span>
                <span className="text-xs text-muted-foreground -mt-1">Home Management System</span>
              </div>
            </Link>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onToggle}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
            
            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Hurtighandlinger
              </h3>
              <div className="space-y-2">
                <Button size="sm" className="w-full justify-start" asChild>
                  <Link href="/items/enhanced" onClick={onToggle}>
                    <Plus className="h-4 w-4 mr-2" />
                    Legg til gjenstand
                  </Link>
                </Button>
                              <Button size="sm" variant="secondary" className="w-full justify-start" asChild>
                <Link href="/garn" onClick={onToggle}>
                  <Palette className="h-4 w-4 mr-2" />
                  Registrer garn
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="w-full justify-start md:hidden" asChild>
                <Link href="/garn/mobile" onClick={onToggle}>
                  <Palette className="h-4 w-4 mr-2" />
                  Garn (Mobil)
                </Link>
              </Button>
                <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                  <Link href="/scan" onClick={onToggle}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Skann QR-kode
                  </Link>
                </Button>
                <Button size="sm" variant="secondary" className="w-full justify-start" asChild>
                  <Link href="/printing/wizard" onClick={onToggle}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Wizard
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="mt-6 pt-6 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Brukermeny
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Bruker</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        bruker@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer" onClick={onToggle}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Innstillinger</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer" onClick={onToggle}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logg ut</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ScrollArea>
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className={cn(
      "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-30 bg-background border-r transition-all duration-200",
      isOpen ? "md:w-64" : "md:w-16"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {isOpen ? (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🏠</span>
            <div className="flex flex-col">
              <span className="font-bold text-lg">HMS</span>
              <span className="text-xs text-muted-foreground -mt-1">Home Management System</span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <span className="text-2xl">🏠</span>
          </Link>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle}
          className={cn("transition-transform", !isOpen && "rotate-180")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !isOpen && "justify-center px-2"
                )}
                title={!isOpen ? item.name : undefined}
              >
                <Icon className={cn("h-4 w-4", isOpen && "mr-3")} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
        
        {/* Quick Actions - only show when expanded */}
        {isOpen && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Hurtighandlinger
            </h3>
            <div className="space-y-1">
              <Button size="sm" className="w-full justify-start" asChild>
                <Link href="/items/enhanced">
                  <Plus className="h-4 w-4 mr-2" />
                  Legg til gjenstand
                </Link>
              </Button>
              <Button size="sm" variant="secondary" className="w-full justify-start" asChild>
                <Link href="/garn">
                  <Palette className="h-4 w-4 mr-2" />
                  Registrer garn
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="w-full justify-start md:hidden" asChild>
                <Link href="/garn/mobile">
                  <Palette className="h-4 w-4 mr-2" />
                  Garn (Mobil)
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                <Link href="/scan">
                  <QrCode className="h-4 w-4 mr-2" />
                  Skann QR-kode
                </Link>
              </Button>
              <Button size="sm" variant="secondary" className="w-full justify-start" asChild>
                <Link href="/printing/wizard">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Wizard
                </Link>
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
      
      {/* User Menu - only show when expanded */}
      {isOpen && (
        <div className="p-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Brukermeny
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Bruker</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    bruker@example.com
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
              <DropdownMenuItem className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logg ut</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
