'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const now = new Date()
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24)
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsVisible(false)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstallable(false)
        localStorage.removeItem('pwa-install-dismissed')
      } else {
        handleDismiss()
      }
    } catch (error) {
      console.error('Install failed:', error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }

  if (!isInstallable || !isVisible) return null

  return (
    <Card className="m-4 border-blue-200 bg-blue-50/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">Installer Hjemmeinventar</h3>
            <p className="text-sm text-gray-600 mt-1">
              Få rask tilgang direkte fra hjemskjermen din. Fungerer uten internett!
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleInstall}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Installer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Utility hook for checking if app is installed
export function useIsAppInstalled() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    // Check if running on iOS and was added to home screen
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    setIsInstalled(isStandalone || isIOSStandalone)
  }, [])

  return isInstalled
}
