'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  Check, 
  Plus,
  Sparkles,
  MapPin,
  Package,
  Settings
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface QuickStartWizardProps {
  onComplete: () => void
  onSkip: () => void
}

export function QuickStartWizard({ onComplete, onSkip }: QuickStartWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    householdName: '',
    selectedLocations: [] as string[],
    selectedCategories: [] as string[],
    firstItem: {
      name: '',
      location: '',
      category: ''
    }
  })

  const steps = [
    {
      id: 'household',
      title: 'Husholdning',
      description: 'Gi husholdningen din et navn',
      icon: Home
    },
    {
      id: 'locations',
      title: 'Lokasjoner',
      description: 'Velg vanlige rom og områder',
      icon: MapPin
    },
    {
      id: 'categories',
      title: 'Kategorier',
      description: 'Velg kategorier du bruker ofte',
      icon: Package
    },
    {
      id: 'first-item',
      title: 'Første gjenstand',
      description: 'Legg til din første gjenstand',
      icon: Plus
    },
    {
      id: 'complete',
      title: 'Ferdig!',
      description: 'Du er klar til å komme i gang',
      icon: Check
    }
  ]

  const defaultLocations = [
    { id: 'living-room', name: 'Stue', icon: '🛋️' },
    { id: 'kitchen', name: 'Kjøkken', icon: '🍳' },
    { id: 'bedroom', name: 'Soverom', icon: '🛏️' },
    { id: 'bathroom', name: 'Bad', icon: '🚿' },
    { id: 'garage', name: 'Garasje', icon: '🚗' },
    { id: 'basement', name: 'Kjeller', icon: '🏠' },
    { id: 'attic', name: 'Loft', icon: '🏠' },
    { id: 'garden', name: 'Hage', icon: '🌱' }
  ]

  const defaultCategories = [
    { id: 'electronics', name: 'Elektronikk', icon: '📱' },
    { id: 'clothing', name: 'Klesplagg', icon: '👕' },
    { id: 'books', name: 'Bøker', icon: '📚' },
    { id: 'tools', name: 'Verktøy', icon: '🔧' },
    { id: 'kitchen', name: 'Kjøkkenutstyr', icon: '🍽️' },
    { id: 'furniture', name: 'Møbler', icon: '🪑' },
    { id: 'decorations', name: 'Dekorasjoner', icon: '🎨' },
    { id: 'sports', name: 'Sportsutstyr', icon: '⚽' }
  ]

  const createHouseholdMutation = trpc.households.create.useMutation()
  const createLocationMutation = trpc.hierarchy.createLocation.useMutation()
  const createItemMutation = trpc.items.create.useMutation()

  const handleNext = async () => {
    if (currentStep === steps.length - 2) {
      // Complete setup
      await completeSetup()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleLocation = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedLocations: prev.selectedLocations.includes(locationId)
        ? prev.selectedLocations.filter(id => id !== locationId)
        : [...prev.selectedLocations, locationId]
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }))
  }

  const completeSetup = async () => {
    try {
      // Create household
      const household = await createHouseholdMutation.mutateAsync({
        name: formData.householdName || 'Mitt Hjem'
      })

      // Create selected locations
      for (const locationId of formData.selectedLocations) {
        const location = defaultLocations.find(l => l.id === locationId)
        if (location) {
          await createLocationMutation.mutateAsync({
            name: location.name,
            type: 'room',
            parentId: null
          })
        }
      }

      // Create first item if provided
      if (formData.firstItem.name) {
        await createItemMutation.mutateAsync({
          name: formData.firstItem.name,
          locationId: formData.firstItem.location,
          category: formData.firstItem.category
        })
      }

      setCurrentStep(steps.length - 1)
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (error) {
      console.error('Setup failed:', error)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Steg {currentStep + 1} av {steps.length}
          </span>
          <span className="text-sm font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
              <steps[currentStep].icon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Household Name */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="householdName">Husholdningens navn</Label>
                <Input
                  id="householdName"
                  placeholder="F.eks. 'Familien Olsen' eller 'Mitt Hjem'"
                  value={formData.householdName}
                  onChange={(e) => setFormData(prev => ({ ...prev, householdName: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Dette navnet brukes for å identifisere din husholdning i systemet.
              </div>
            </div>
          )}

          {/* Step 2: Locations */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Velg rom og områder du har i hjemmet ditt:
              </div>
              <div className="grid grid-cols-2 gap-3">
                {defaultLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => toggleLocation(location.id)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      formData.selectedLocations.includes(location.id)
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{location.icon}</span>
                      <span className="font-medium">{location.name}</span>
                    </div>
                    {formData.selectedLocations.includes(location.id) && (
                      <Check className="w-4 h-4 text-yellow-600 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Categories */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Velg kategorier du bruker ofte for å organisere gjenstander:
              </div>
              <div className="grid grid-cols-2 gap-3">
                {defaultCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      formData.selectedCategories.includes(category.id)
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    {formData.selectedCategories.includes(category.id) && (
                      <Check className="w-4 h-4 text-yellow-600 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: First Item */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Legg til din første gjenstand for å komme i gang:
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="itemName">Gjenstandens navn</Label>
                  <Input
                    id="itemName"
                    placeholder="F.eks. 'Kaffemaskin' eller 'Strikkepinner'"
                    value={formData.firstItem.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      firstItem: { ...prev.firstItem, name: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="itemLocation">Lokasjon</Label>
                  <select
                    id="itemLocation"
                    value={formData.firstItem.location}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      firstItem: { ...prev.firstItem, location: e.target.value }
                    }))}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Velg lokasjon</option>
                    {formData.selectedLocations.map(locationId => {
                      const location = defaultLocations.find(l => l.id === locationId)
                      return (
                        <option key={locationId} value={locationId}>
                          {location?.name}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <Label htmlFor="itemCategory">Kategori</Label>
                  <select
                    id="itemCategory"
                    value={formData.firstItem.category}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      firstItem: { ...prev.firstItem, category: e.target.value }
                    }))}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Velg kategori</option>
                    {formData.selectedCategories.map(categoryId => {
                      const category = defaultCategories.find(c => c.id === categoryId)
                      return (
                        <option key={categoryId} value={categoryId}>
                          {category?.name}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Oppsett fullført!</h3>
                <p className="text-muted-foreground">
                  Du blir sendt til dashboard om et øyeblikk...
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">
                  {formData.selectedLocations.length} lokasjoner
                </Badge>
                <Badge variant="outline">
                  {formData.selectedCategories.length} kategorier
                </Badge>
                {formData.firstItem.name && (
                  <Badge variant="outline">
                    1 gjenstand lagt til
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          {currentStep < steps.length - 1 && (
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbake
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !formData.householdName) ||
                  (currentStep === 1 && formData.selectedLocations.length === 0) ||
                  (currentStep === 2 && formData.selectedCategories.length === 0)
                }
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {currentStep === steps.length - 2 ? 'Fullfør oppsett' : 'Neste'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip Button */}
      {currentStep < steps.length - 1 && (
        <div className="text-center mt-4">
          <Button variant="ghost" onClick={onSkip}>
            Hopp over oppsettet
          </Button>
        </div>
      )}
    </div>
  )
}
