import { useState, useEffect } from 'react'

interface PageConfig {
  id: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  description: string
  isActive: boolean
  isCore?: boolean
}

export function useActivePages() {
  const [activePagesConfig, setActivePagesConfig] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load configuration from localStorage
  useEffect(() => {
    const loadConfiguration = () => {
      try {
        const saved = localStorage.getItem('active-pages-config')
        if (saved) {
          setActivePagesConfig(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Error loading active pages configuration:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConfiguration()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'active-pages-config') {
        loadConfiguration()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Check if a page is active
  const isPageActive = (pageId: string): boolean => {
    // If no configuration exists, all pages are active (backward compatibility)
    if (Object.keys(activePagesConfig).length === 0) {
      return true
    }
    
    // Check if this specific page is explicitly set to false
    return activePagesConfig[pageId] !== false
  }

  // Update page active state
  const updatePageActive = (pageId: string, isActive: boolean) => {
    const newConfig = { ...activePagesConfig, [pageId]: isActive }
    setActivePagesConfig(newConfig)
    
    try {
      localStorage.setItem('active-pages-config', JSON.stringify(newConfig))
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('active-pages-config-changed'))
    } catch (error) {
      console.error('Error saving active pages configuration:', error)
    }
  }

  // Save entire configuration
  const saveConfiguration = (config: Record<string, boolean>) => {
    setActivePagesConfig(config)
    
    try {
      localStorage.setItem('active-pages-config', JSON.stringify(config))
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('active-pages-config-changed'))
    } catch (error) {
      console.error('Error saving active pages configuration:', error)
    }
  }

  // Reset to defaults
  const resetToDefaults = (defaultConfig: Record<string, boolean>) => {
    setActivePagesConfig(defaultConfig)
    
    try {
      localStorage.setItem('active-pages-config', JSON.stringify(defaultConfig))
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('active-pages-config-changed'))
    } catch (error) {
      console.error('Error saving active pages configuration:', error)
    }
  }

  return {
    activePagesConfig,
    isLoading,
    isPageActive,
    updatePageActive,
    saveConfiguration,
    resetToDefaults
  }
}
