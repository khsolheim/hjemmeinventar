'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { LocationType } from '@prisma/client'

export interface WizardLocation {
  id: string
  name: string
  displayName?: string
  type: LocationType
  level: number
  autoNumber?: string
  parentId?: string
  children?: WizardLocation[]
  itemCount?: number
  isPrivate?: boolean
  colorCode?: string
  tags?: string[]
  qrCode?: string
}

export interface WizardState {
  step: 'welcome' | 'type-selection' | 'hierarchy-builder' | 'location-form'
  showWelcome: boolean
  selectedType?: LocationType
  selectedParent?: WizardLocation
  currentLocation?: WizardLocation
  locations: WizardLocation[]
  isLoading: boolean
}

interface LocationWizardContextType {
  state: WizardState
  
  // Navigation
  goToWelcome: () => void
  goToTypeSelection: (parent?: WizardLocation) => void
  goToHierarchyBuilder: () => void
  goToLocationForm: (type: LocationType, parent?: WizardLocation) => void
  goBack: () => void
  
  // Tutorial
  skipTutorial: (permanently?: boolean) => void
  
  // Locations
  setLocations: (locations: WizardLocation[]) => void
  addLocation: (location: WizardLocation) => void
  updateLocation: (id: string, updates: Partial<WizardLocation>) => void
  removeLocation: (id: string) => void
  
  // State management
  setLoading: (loading: boolean) => void
  resetWizard: () => void
}

const LocationWizardContext = createContext<LocationWizardContextType | undefined>(undefined)

export function useLocationWizard() {
  const context = useContext(LocationWizardContext)
  if (!context) {
    throw new Error('useLocationWizard must be used within a LocationWizardProvider')
  }
  return context
}

interface LocationWizardProviderProps {
  children: React.ReactNode
  initialLocations?: WizardLocation[]
  skipWelcome?: boolean
}

export function LocationWizardProvider({ 
  children, 
  initialLocations = [],
  skipWelcome = false 
}: LocationWizardProviderProps) {
  
  const [state, setState] = useState<WizardState>({
    step: skipWelcome ? 'hierarchy-builder' : 'welcome',
    showWelcome: !skipWelcome,
    locations: initialLocations,
    isLoading: false
  })

  // Navigation functions
  const goToWelcome = useCallback(() => {
    setState(prev => ({ ...prev, step: 'welcome', showWelcome: true }))
  }, [])

  const goToTypeSelection = useCallback((parent?: WizardLocation) => {
    setState(prev => ({ 
      ...prev, 
      step: 'type-selection',
      selectedParent: parent,
      selectedType: undefined
    }))
  }, [])

  const goToHierarchyBuilder = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      step: 'hierarchy-builder',
      selectedType: undefined,
      selectedParent: undefined,
      currentLocation: undefined
    }))
  }, [])

  const goToLocationForm = useCallback((type: LocationType, parent?: WizardLocation) => {
    setState(prev => ({ 
      ...prev, 
      step: 'location-form',
      selectedType: type,
      selectedParent: parent
    }))
  }, [])

  const goBack = useCallback(() => {
    setState(prev => {
      switch (prev.step) {
        case 'type-selection':
          return { ...prev, step: 'hierarchy-builder' }
        case 'location-form':
          return { ...prev, step: 'type-selection' }
        case 'hierarchy-builder':
          return prev.showWelcome 
            ? { ...prev, step: 'welcome' }
            : prev
        default:
          return prev
      }
    })
  }, [])

  // Tutorial functions
  const skipTutorial = useCallback((permanently = false) => {
    if (permanently) {
      // Lagre i localStorage at tutorial skal hoppes over
      localStorage.setItem('location-wizard-skip-tutorial', 'true')
    }
    setState(prev => ({ 
      ...prev, 
      step: 'hierarchy-builder',
      showWelcome: false 
    }))
  }, [])

  // Location management
  const setLocations = useCallback((locations: WizardLocation[]) => {
    setState(prev => ({ ...prev, locations }))
  }, [])

  const addLocation = useCallback((location: WizardLocation) => {
    setState(prev => ({
      ...prev,
      locations: [...prev.locations, location]
    }))
  }, [])

  const updateLocation = useCallback((id: string, updates: Partial<WizardLocation>) => {
    setState(prev => ({
      ...prev,
      locations: prev.locations.map(loc => 
        loc.id === id ? { ...loc, ...updates } : loc
      )
    }))
  }, [])

  const removeLocation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== id)
    }))
  }, [])

  // State management
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  const resetWizard = useCallback(() => {
    setState({
      step: 'welcome',
      showWelcome: true,
      locations: [],
      isLoading: false
    })
  }, [])

  const contextValue: LocationWizardContextType = {
    state,
    
    // Navigation
    goToWelcome,
    goToTypeSelection,
    goToHierarchyBuilder,
    goToLocationForm,
    goBack,
    
    // Tutorial
    skipTutorial,
    
    // Locations
    setLocations,
    addLocation,
    updateLocation,
    removeLocation,
    
    // State management
    setLoading,
    resetWizard
  }

  return (
    <LocationWizardContext.Provider value={contextValue}>
      {children}
    </LocationWizardContext.Provider>
  )
}

// Helper hook for checking if tutorial should be skipped
export function useShouldSkipTutorial(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('location-wizard-skip-tutorial') === 'true'
}