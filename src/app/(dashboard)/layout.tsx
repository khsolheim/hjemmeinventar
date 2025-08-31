'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { QuickAddModal } from '@/components/ui/quick-add-modal'
import { OfflineStatus } from '@/components/pwa/OfflineStatus'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { offlineService, backgroundSync } from '@/lib/offline-service'
import { registerServiceWorker } from '@/lib/service-worker'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  // Handle responsive behavior and initialize services
  useEffect(() => {
    setMounted(true)

    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(true) // Open by default on desktop
      } else {
        setIsSidebarOpen(false) // Closed by default on mobile
      }
    }

    // Initialize offline service and background sync
    const initializeServices = async () => {
      try {
        // Initialize offline service on client side
        offlineService.initClientSide()

        // Register service worker (both development and production)
        registerServiceWorker()
        
        // Register background sync if supported
        await backgroundSync.register()

        // Clean up old offline queue items (older than 7 days)
        offlineService.cleanupOldItems()
      } catch (error) {
        console.warn('Service initialization failed:', error)
      }
    }

    initializeServices()

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse">Laster...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        isMobile={false}
      />
      
      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        isMobile={true}
      />
      
      {/* Main Content Area */}
      <div className={`md:transition-all md:duration-200 ${
        isSidebarOpen ? 'md:pl-64' : 'md:pl-16'
      }`}>
        <Header onToggleSidebar={toggleSidebar} />

        {/* Offline Status - Only show in production */}
        {process.env.NODE_ENV === 'production' && (
          <div className="px-4 md:px-6">
            <OfflineStatus />
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Floating Action Button for Quick Add */}
      <Button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 z-50"
        aria-label="Hurtig tillegg av gjenstand"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Quick Add Modal */}
      <QuickAddModal
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
      />
    </div>
  )
}
