'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useActivePages } from '@/hooks/useActivePages'
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
  Printer,
  Search,
  Sparkles,
  Trophy,
  ExternalLink,
  AlertTriangle,
  Leaf,
  Wifi,
  Cpu,
  Link as LinkIcon,
  Zap,
  Mic,
  Camera,
  Bell
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

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
  id?: string
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

export function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Load from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-expanded-items')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  
  const { activePagesConfig, isPageActive } = useActivePages()
  
  // Listen for active pages configuration changes
  useEffect(() => {
    const handleActivePagesChange = () => {
      // Force re-render when active pages config changes
      // The useActivePages hook will handle the actual update
    }
    
    window.addEventListener('active-pages-config-changed', handleActivePagesChange)
    
    return () => {
      window.removeEventListener('active-pages-config-changed', handleActivePagesChange)
    }
  }, [])
  
  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      const newExpanded = prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-expanded-items', JSON.stringify(newExpanded))
      }
      
      return newExpanded
    })
  }
  
  const allNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, id: 'dashboard' },
    { 
      name: 'Gjenstander', 
      href: '/items', 
      icon: Package,
      id: 'items',
      children: [
        { name: 'Garn', href: '/garn', icon: Palette, id: 'garn' },
        { name: 'Mønstre', href: '/patterns', icon: FileText, id: 'patterns' }
      ]
    },
    { name: 'Quick Add', href: '/quick-add', icon: Plus, id: 'quick-add' },
    { name: 'Smart Search', href: '/search', icon: Search, id: 'search' },
    { name: 'Personalization', href: '/personalization', icon: Settings, id: 'personalization' },
    { name: 'Advanced Analytics', href: '/advanced-analytics', icon: BarChart3, id: 'advanced-analytics' },
    { name: 'Smart Inventory', href: '/smart-inventory', icon: Package, id: 'smart-inventory' },
    { name: 'Gamification', href: '/gamification', icon: Trophy, id: 'gamification' },
    { name: 'Collaboration', href: '/collaboration', icon: Users, id: 'collaboration' },
    { name: 'Integrations', href: '/integrations', icon: ExternalLink, id: 'integrations' },
    { name: 'Emergency', href: '/emergency', icon: AlertTriangle, id: 'emergency' },
    { name: 'Sustainability', href: '/sustainability', icon: Leaf, id: 'sustainability' },
    { name: 'AI Assistant', href: '/ai', icon: Brain, id: 'ai' },
    { name: 'IoT Devices', href: '/iot', icon: Wifi, id: 'iot' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, id: 'analytics' },
    { name: 'Machine Learning', href: '/ml', icon: Cpu, id: 'ml' },
    { name: 'Security', href: '/security', icon: Shield, id: 'security' },
    { name: 'Blockchain', href: '/blockchain', icon: LinkIcon, id: 'blockchain' },
    { name: 'Automation', href: '/automation', icon: Zap, id: 'automation' },
    { name: 'Reporting', href: '/reporting', icon: BarChart3, id: 'reporting' },
    { name: 'Mobile', href: '/mobile', icon: Smartphone, id: 'mobile' },
    { name: 'Voice', href: '/voice', icon: Mic, id: 'voice' },
    { name: 'Camera', href: '/camera', icon: Camera, id: 'camera' },
    { name: 'Location', href: '/location', icon: MapPin, id: 'location' },
    { name: 'Notifications', href: '/notifications', icon: Bell, id: 'notifications' },
    { name: 'Test Features', href: '/test-features', icon: Sparkles, id: 'test-features' },
    { name: 'Printing', href: '/printing', icon: Printer, id: 'printing' },
    { name: 'Utlån', href: '/loans', icon: UserCheck, id: 'loans' },
    { name: 'Skann QR', href: '/scan', icon: QrCode, id: 'scan' },
    { 
      name: 'Innstillinger', 
      href: '/settings', 
      icon: Settings,
      id: 'settings',
      children: [
        { name: 'Lokasjoner', href: '/locations', icon: MapPin, id: 'locations' },
        { name: 'Kategorier', href: '/categories', icon: Grid3x3, id: 'categories' },
        { name: 'Husholdninger', href: '/households', icon: Users, id: 'households' },
        { name: 'Samarbeid', href: '/collaboration', icon: Activity, id: 'collaboration' },
        { name: 'AI-Funksjoner', href: '/ai', icon: Brain, id: 'ai' },
        { name: 'Import/Export', href: '/import-export', icon: Database, id: 'import-export' },
        { name: 'Mobile', href: '/mobile', icon: Smartphone, id: 'mobile' },
        { name: 'Analytics', href: '/analytics', icon: BarChart3, id: 'analytics' },
        { name: 'Admin', href: '/admin', icon: Settings, id: 'admin' }
      ]
    }
  ]

  // Filter navigation based on active pages configuration
  const filterNavigation = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // Check if this item is active
      const isActive = isPageActive(item.id || '')
      
      // Filter children if they exist
      if (item.children) {
        const filteredChildren = filterNavigation(item.children)
        return isActive && filteredChildren.length > 0
      }
      
      return isActive
    }).map(item => ({
      ...item,
      children: item.children ? filterNavigation(item.children) : undefined
    }))
  }

  const navigation = filterNavigation(allNavigation)
  
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
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const hasChildren = item.children && item.children.length > 0
                const isExpanded = expandedItems.includes(item.name)
                
                return (
                  <div key={item.name}>
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={onToggle}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-1",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                      {hasChildren && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(item.name)}
                          className="p-1"
                        >
                          <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
                        </Button>
                      )}
                    </div>
                    
                    {hasChildren && isExpanded && item.children && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon
                          const isChildActive = pathname === child.href
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={onToggle}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isChildActive 
                                  ? "bg-primary/20 text-primary" 
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <ChildIcon className="h-4 w-4" />
                              <span>{child.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.includes(item.name)
            
            return (
              <div key={item.name}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-1",
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
                  {hasChildren && isOpen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.name)}
                      className="p-1"
                    >
                      <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
                    </Button>
                  )}
                </div>
                
                {hasChildren && isExpanded && isOpen && item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon
                      const isChildActive = pathname === child.href
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isChildActive 
                              ? "bg-primary/20 text-primary" 
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <ChildIcon className="h-4 w-4 mr-3" />
                          <span>{child.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
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
