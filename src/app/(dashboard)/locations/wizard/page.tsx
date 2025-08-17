'use client'

import { LocationWizardProvider, useShouldSkipTutorial } from '@/components/locations/wizard/LocationWizardProvider'
import { LocationWizard } from '@/components/locations/wizard/LocationWizard'

export default function LocationWizardPage() {
  const skipWelcome = useShouldSkipTutorial()

  return (
    <LocationWizardProvider skipWelcome={skipWelcome}>
      <LocationWizard />
    </LocationWizardProvider>
  )
}