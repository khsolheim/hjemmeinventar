'use client'

import { ReactNode } from 'react'
import { usePlatform } from '@/lib/platform/platform-detector'
import { cn } from '@/lib/utils'

interface AdaptiveLayoutProps {
  children: ReactNode
  className?: string
}

export function AdaptiveLayout({ children, className }: AdaptiveLayoutProps) {
  const { platform, loading } = usePlatform()

  if (loading || !platform) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Laster...</div>
      </div>
    )
  }

  const uiConfig = platform ? new (await import('@/lib/platform/platform-detector')).PlatformDetector().getUIConfig(platform) : null

  return (
    <div 
      className={cn(
        'min-h-screen transition-all duration-300',
        // Platform-specific layouts
        platform.isDesktop && 'flex',
        platform.isMobile && 'block',
        platform.isTablet && 'flex flex-col',
        className
      )}
      style={{
        padding: uiConfig?.containerPadding || '1rem'
      }}
    >
      {/* Desktop: Sidebar + Main */}
      {platform.isDesktop && (
        <>
          <aside className="w-64 bg-card border-r">
            <DesktopSidebar />
          </aside>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </>
      )}

      {/* Mobile: Bottom Navigation */}
      {platform.isMobile && (
        <>
          <main className="pb-16">
            {children}
          </main>
          <MobileBottomNav />
        </>
      )}

      {/* Tablet: Top Tabs */}
      {platform.isTablet && (
        <>
          <TabletTopNav />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </>
      )}

      {/* PWA Install Prompt */}
      {platform.canInstall && !platform.isPWA && (
        <PWAInstallBanner />
      )}
    </div>
  )
}

// Desktop Sidebar
function DesktopSidebar() {
  return (
    <nav className="p-4 space-y-2">
      <h2 className="font-bold text-lg mb-4">HMS</h2>
      <SidebarLink href="/dashboard" icon="🏠" label="Dashboard" />
      <SidebarLink href="/items" icon="📦" label="Gjenstander" />
      <SidebarLink href="/locations" icon="📍" label="Lokasjoner" />
      <SidebarLink href="/scan" icon="📱" label="Skann QR" />
      <SidebarLink href="/search" icon="🔍" label="Søk" />
      <SidebarLink href="/analytics" icon="📊" label="Analyse" />
      <SidebarLink href="/settings" icon="⚙️" label="Innstillinger" />
    </nav>
  )
}

// Mobile Bottom Navigation
function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex justify-around py-2">
        <BottomNavItem href="/dashboard" icon="🏠" label="Hjem" />
        <BottomNavItem href="/items" icon="📦" label="Ting" />
        <BottomNavItem href="/scan" icon="📱" label="Skann" />
        <BottomNavItem href="/search" icon="🔍" label="Søk" />
        <BottomNavItem href="/settings" icon="⚙️" label="Mer" />
      </div>
    </nav>
  )
}

// Tablet Top Navigation
function TabletTopNav() {
  return (
    <nav className="bg-background border-b">
      <div className="flex justify-center space-x-8 py-3">
        <TabNavItem href="/dashboard" icon="🏠" label="Dashboard" />
        <TabNavItem href="/items" icon="📦" label="Gjenstander" />
        <TabNavItem href="/locations" icon="📍" label="Lokasjoner" />
        <TabNavItem href="/scan" icon="📱" label="Skann" />
        <TabNavItem href="/analytics" icon="📊" label="Analyse" />
      </div>
    </nav>
  )
}

// PWA Install Banner
function PWAInstallBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 text-center z-50">
      <p className="text-sm">
        📱 Installer HMS som app for bedre opplevelse!
        <button className="ml-2 underline font-semibold">
          Installer
        </button>
      </p>
    </div>
  )
}

// Helper Components
function SidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a 
      href={href}
      className="flex items-center space-x-3 p-2 rounded hover:bg-accent transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </a>
  )
}

function BottomNavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a 
      href={href}
      className="flex flex-col items-center space-y-1 p-2 min-w-0 flex-1"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs truncate">{label}</span>
    </a>
  )
}

function TabNavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a 
      href={href}
      className="flex items-center space-x-2 p-2 rounded hover:bg-accent transition-colors"
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  )
}
