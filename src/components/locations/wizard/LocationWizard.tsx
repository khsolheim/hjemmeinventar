'use client'

import { useEffect, useState } from 'react'
import { useLocationWizard, WizardLocation, useShouldSkipTutorial } from './LocationWizardProvider'
import { WizardWelcome } from './WizardWelcome'
import { LocationTypeSelector } from './LocationTypeSelector'
import { HierarchyBuilder } from './HierarchyBuilder'
import { LocationForm, LocationFormData } from './LocationForm'
import { QRCodeModal } from './QRCodeModal'
import { PrivacySettingsModal, PrivacySettings } from './PrivacySettingsModal'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { LocationType } from '@prisma/client'
import { AutoNamingService } from '@/lib/services/auto-naming-service'

export function LocationWizard() {
  const { 
    state, 
    goToWelcome,
    goToTypeSelection, 
    goToHierarchyBuilder, 
    goToLocationForm,
    goBack,
    skipTutorial,
    setLocations,
    addLocation,
    updateLocation,
    removeLocation,
    setLoading
  } = useLocationWizard()

  const [suggestedName, setSuggestedName] = useState<string>('')
  const [suggestedAutoNumber, setSuggestedAutoNumber] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState<WizardLocation | null>(null)
  const [editingLocation, setEditingLocation] = useState<WizardLocation | null>(null)
  const [showPrivacyModal, setShowPrivacyModal] = useState<WizardLocation | null>(null)

  // tRPC queries and mutations
  const { data: locations = [], isLoading: locationsLoading, refetch } = trpc.locations.getAll.useQuery()
  const createLocationMutation = trpc.locations.createWithWizard.useMutation({
    onSuccess: (newLocation) => {
      toast.success('Lokasjon opprettet!')
      refetch()
      goToHierarchyBuilder()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const generateAutoNameQuery = trpc.locations.generateAutoName.useQuery(
    {
      type: state.selectedType!,
      parentId: state.selectedParent?.id
    },
    {
      enabled: !!state.selectedType && state.step === 'location-form'
    }
  )

  // Handle auto name generation success
  useEffect(() => {
    if (generateAutoNameQuery.data) {
      setSuggestedName(generateAutoNameQuery.data.name)
      setSuggestedAutoNumber(generateAutoNameQuery.data.autoNumber)
    }
  }, [generateAutoNameQuery.data])

  // Check if tutorial should be skipped on mount
  const shouldSkipTutorial = useShouldSkipTutorial()
  useEffect(() => {
    if (shouldSkipTutorial && state.showWelcome) {
      skipTutorial(false) // Don't save again, just skip
    }
  }, [state.showWelcome, skipTutorial, shouldSkipTutorial])

  // Update wizard locations when data changes
  useEffect(() => {
    if (locations) {
      const wizardLocations: WizardLocation[] = flattenToWizardLocations(locations)
      setLocations(wizardLocations)
    }
  }, [locations, setLocations])

  // Set loading state
  useEffect(() => {
    setLoading(locationsLoading || createLocationMutation.isPending || generateAutoNameQuery.isLoading)
  }, [locationsLoading, createLocationMutation.isPending, generateAutoNameQuery.isLoading, setLoading])

  // Convert database locations to wizard format
  const flattenToWizardLocations = (dbLocations: any[]): WizardLocation[] => {
    const convertLocation = (loc: any): WizardLocation => ({
      id: loc.id,
      name: loc.name,
      displayName: loc.displayName,
      type: loc.type,
      level: loc.level || 0,
      autoNumber: loc.autoNumber,
      parentId: loc.parentId,
      itemCount: loc._count?.items || 0,
      isPrivate: loc.isPrivate,
      colorCode: loc.colorCode,
      tags: loc.tags ? JSON.parse(loc.tags) : [],
      qrCode: loc.qrCode,
      children: loc.children ? loc.children.map(convertLocation) : []
    })

    return dbLocations.map(convertLocation)
  }

  // Handle location creation
  const handleCreateLocation = async (parentId: string | undefined, type: LocationType) => {
    goToLocationForm(type, state.locations.find(loc => loc.id === parentId))
  }

  // Handle location form save
  const handleSaveLocation = async (formData: LocationFormData) => {
    try {
      await createLocationMutation.mutateAsync({
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        type: formData.type,
        parentId: formData.parentId,
        autoNumber: formData.autoNumber,
        level: state.selectedParent ? state.selectedParent.level + 1 : 0,
        isPrivate: formData.isPrivate,
        colorCode: formData.colorCode,
        tags: formData.tags,
        wizardOrder: 1 // Will be calculated by AutoNamingService
      })
    } catch (error) {
      console.error('Error creating location:', error)
    }
  }

  // Handle location editing
  const handleEditLocation = (location: WizardLocation) => {
    setEditingLocation(location)
    goToLocationForm(location.type, state.locations.find(loc => loc.id === location.parentId))
  }

  // Handle location deletion
  const handleDeleteLocation = async (locationId: string) => {
    // TODO: Implement delete mutation
    toast.info('Sletting kommer snart')
  }

  // Handle QR code display
  const handleShowQR = (location: WizardLocation) => {
    setShowQRCode(location)
  }

  // Handle privacy settings
  const handleEditPrivacy = (location: WizardLocation) => {
    setShowPrivacyModal(location)
  }

  // Handle privacy settings save
  const handleSavePrivacy = async (privacySettings: PrivacySettings) => {
    // TODO: Implement privacy update mutation
    console.log('Saving privacy settings:', privacySettings)
    toast.success('Privacy innstillinger lagret')
    // Update local state
    updateLocation(showPrivacyModal!.id, {
      isPrivate: privacySettings.isPrivate
      // allowedUsers: privacySettings.allowedUsers // TODO: Add allowedUsers to WizardLocation type
    })
  }

  // Render current step
  const renderCurrentStep = () => {
    switch (state.step) {
      case 'welcome':
        return (
          <WizardWelcome
            onContinue={goToHierarchyBuilder}
            onSkipTutorial={skipTutorial}
          />
        )

      case 'type-selection':
        const allowedTypes = state.selectedParent 
          ? AutoNamingService.getAllowedChildTypes(state.selectedParent.type)
          : [LocationType.ROOM]

        return (
          <LocationTypeSelector
            allowedTypes={allowedTypes}
            onSelect={(type) => goToLocationForm(type, state.selectedParent)}
            onBack={goBack}
            currentLocation={state.selectedParent}
            title={state.selectedParent ? `Legg til i ${state.selectedParent.name}` : 'Hva vil du opprette?'}
            description={state.selectedParent ? 'Velg type lokasjon å legge til' : 'Velg type lokasjon du vil opprette'}
          />
        )

      case 'hierarchy-builder':
        return (
          <HierarchyBuilder
            locations={state.locations}
            onAddLocation={handleCreateLocation}
            onEditLocation={handleEditLocation}
            onDeleteLocation={handleDeleteLocation}
            onShowQR={handleShowQR}
            onEditPrivacy={handleEditPrivacy}
            onBack={state.showWelcome ? goToWelcome : undefined}
            isLoading={state.isLoading}
          />
        )

      case 'location-form':
        if (!state.selectedType) {
          goToHierarchyBuilder()
          return null
        }

        return (
          <LocationForm
            type={state.selectedType}
            parent={state.selectedParent}
            editingLocation={editingLocation || undefined}
            suggestedName={suggestedName}
            suggestedAutoNumber={suggestedAutoNumber}
            onSave={handleSaveLocation}
            onCancel={() => {
              setEditingLocation(null)
              setSuggestedName('')
              setSuggestedAutoNumber('')
              goBack()
            }}
            isLoading={createLocationMutation.isPending}
          />
        )

      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Laster wizard...</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      {renderCurrentStep()}
      
      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeModal
          location={showQRCode}
          isOpen={!!showQRCode}
          onClose={() => setShowQRCode(null)}
          onPrint={(location) => {
            // TODO: Integrate with DYMO printing
            toast.info('DYMO printing kommer snart')
                     }}
         />
       )}

       {/* Privacy Settings Modal */}
       {showPrivacyModal && (
         <PrivacySettingsModal
           location={showPrivacyModal}
           isOpen={!!showPrivacyModal}
           onClose={() => setShowPrivacyModal(null)}
           onSave={handleSavePrivacy}
         />
       )}
     </div>
   )
 }