'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(true) // Open by default on desktop
      } else {
        setIsSidebarOpen(false) // Closed by default on mobile
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
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
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
