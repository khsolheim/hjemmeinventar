'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  Package,
  MapPin,
  QrCode,
  Camera,
  Sparkles,
  Target,
  BookOpen,
  Users,
  Settings
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

interface OnboardingWizardProps {
  onComplete: () => void
  onSkip?: () => void
  className?: string
}

export function OnboardingWizard({ onComplete, onSkip, className = '' }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState({
    // Step 1: Preferences
    primaryUse: '',
    householdSize: '',
    inventoryTypes: [] as string[],
    
    // Step 2: First Location
    firstLocationName: '',
    firstLocationType: 'ROOM' as const,
    
    // Step 3: Sample Item
    sampleItemName: '',
    sampleItemCategory: '',
    
    // Step 4: Settings
    enableNotifications: true,
    enableQRPrinting: false,
    defaultUnit: 'stk'
  })

  // Mutations
  const createLocationMutation = trpc.locations.create.useMutation()
  const createItemMutation = trpc.items.create.useMutation()
  const initializeCategoriesMutation = trpc.categories.initializeDefaults.useMutation()

  const inventoryTypeOptions = [
    { value: 'food', label: 'Mat og drikke', icon: '🍎' },
    { value: 'yarn', label: 'Garn og strikking', icon: '🧶' },
    { value: 'electronics', label: 'Elektronikk', icon: '💻' },
    { value: 'tools', label: 'Verktøy', icon: '🔧' },
    { value: 'books', label: 'Bøker', icon: '📚' },
    { value: 'clothes', label: 'Klær', icon: '👕' },
    { value: 'hobby', label: 'Hobby og kreativt', icon: '🎨' },
    { value: 'beauty', label: 'Helse og skjønnhet', icon: '💄' }
  ]

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Velkommen til HMS! 🎉',
      description: 'La oss sette opp ditt personlige inventarsystem på noen minutter',
      icon: Sparkles,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Home className="w-16 h-16 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Få full kontroll over tingene dine</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Med HMS (Home Management System) kan du enkelt holde oversikt over alt du eier, 
              fra mat i kjøleskapet til hobbyutstyr i bod.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xs">Organiser gjenstander</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs">QR-kode etiketter</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs">Ta bilder</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-xs">Finn alt raskt</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Fortell oss om deg',
      description: 'Dette hjelper oss å tilpasse opplevelsen for dine behov',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="primary-use">Hva er hovedformålet med inventaret?</Label>
            <Select 
              value={userData.primaryUse} 
              onValueChange={(value) => setUserData({...userData, primaryUse: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg hovedformål" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="household">Husholdning og mat</SelectItem>
                <SelectItem value="hobby">Hobby og kreative prosjekter</SelectItem>
                <SelectItem value="business">Små bedrift eller verksted</SelectItem>
                <SelectItem value="collection">Samlinger og verdifulle ting</SelectItem>
                <SelectItem value="storage">Lager og oppbevaring</SelectItem>
                <SelectItem value="general">Generell oversikt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="household-size">Hvor mange bor i husholdningen?</Label>
            <Select 
              value={userData.householdSize} 
              onValueChange={(value) => setUserData({...userData, householdSize: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg antall personer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 person</SelectItem>
                <SelectItem value="2">2 personer</SelectItem>
                <SelectItem value="3-4">3-4 personer</SelectItem>
                <SelectItem value="5+">5+ personer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hvilke typer ting vil du registrere? (velg flere)</Label>
            <div className="grid grid-cols-2 gap-2">
              {inventoryTypeOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    userData.inventoryTypes.includes(option.value)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    const types = userData.inventoryTypes.includes(option.value)
                      ? userData.inventoryTypes.filter(t => t !== option.value)
                      : [...userData.inventoryTypes, option.value]
                    setUserData({...userData, inventoryTypes: types})
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'first-location',
      title: 'Opprett din første lokasjon',
      description: 'Start med å lage et rom eller oppbevaringssted',
      icon: MapPin,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">La oss starte enkelt</h3>
            <p className="text-muted-foreground">
              Hver gjenstand i systemet må tilhøre en lokasjon. Dette kan være et rom, 
              en hylle, en boks - hva som helst!
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location-name">Navn på lokasjon</Label>
              <Input
                id="location-name"
                placeholder="F.eks. Kjøkken, Soverom, Lekerommet"
                value={userData.firstLocationName}
                onChange={(e) => setUserData({...userData, firstLocationName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-type">Type lokasjon</Label>
              <Select 
                value={userData.firstLocationType} 
                onValueChange={(value: any) => setUserData({...userData, firstLocationType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROOM">🏠 Rom</SelectItem>
                  <SelectItem value="SHELF">📚 Hylle</SelectItem>
                  <SelectItem value="BOX">📦 Boks</SelectItem>
                  <SelectItem value="CONTAINER">🥡 Beholder</SelectItem>
                  <SelectItem value="DRAWER">🗃️ Skuff</SelectItem>
                  <SelectItem value="CABINET">🚪 Skap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">QR-kode inkludert!</h4>
                  <p className="text-sm text-blue-700">
                    Hver lokasjon får automatisk en unik QR-kode som du kan skrive ut 
                    og feste på stedet. Skann koden for å se alt som er der!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sample-item',
      title: 'Registrer din første gjenstand',
      description: 'Prøv å legge til noe enkelt for å se hvordan det fungerer',
      icon: Package,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Test med en gjenstand</h3>
            <p className="text-muted-foreground">
              Velg noe enkelt du har i nærheten - kanskje en kaffe, en bok, eller en strikkestrømpel?
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Navn på gjenstand</Label>
              <Input
                id="item-name"
                placeholder="F.eks. Tine Melk, Harry Potter bok, DROPS garn"
                value={userData.sampleItemName}
                onChange={(e) => setUserData({...userData, sampleItemName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-category">Kategori (valgfritt)</Label>
              <Select 
                value={userData.sampleItemCategory} 
                onValueChange={(value) => setUserData({...userData, sampleItemCategory: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen kategori</SelectItem>
                  {inventoryTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Tips!</h4>
                  <p className="text-sm text-green-700">
                    Senere kan du ta bilder, skanne strekkoder, sette utløpsdatoer, 
                    og mye mer. Vi holder det enkelt for nå!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Tilpass innstillingene',
      description: 'Sett opp systemet akkurat som du vil ha det',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Siste justeringer</h3>
            <p className="text-muted-foreground">
              Disse innstillingene kan endres når som helst senere
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Varslinger</h4>
                <p className="text-sm text-muted-foreground">
                  Få beskjed om utløpsdatoer og lavt lager
                </p>
              </div>
              <Button
                variant={userData.enableNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setUserData({...userData, enableNotifications: !userData.enableNotifications})}
              >
                {userData.enableNotifications ? "På" : "Av"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">QR-kode utskrift</h4>
                <p className="text-sm text-muted-foreground">
                  Skriv ut etiketter til DYMO skriver
                </p>
              </div>
              <Button
                variant={userData.enableQRPrinting ? "default" : "outline"}
                size="sm"
                onClick={() => setUserData({...userData, enableQRPrinting: !userData.enableQRPrinting})}
              >
                {userData.enableQRPrinting ? "På" : "Av"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-unit">Standard måleenhet</Label>
              <Select 
                value={userData.defaultUnit} 
                onValueChange={(value) => setUserData({...userData, defaultUnit: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stk">stk (stykker)</SelectItem>
                  <SelectItem value="kg">kg (kilogram)</SelectItem>
                  <SelectItem value="gram">gram</SelectItem>
                  <SelectItem value="liter">liter</SelectItem>
                  <SelectItem value="ml">ml (milliliter)</SelectItem>
                  <SelectItem value="nøste">nøste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Alt er klart! 🎉',
      description: 'Du er nå klar til å organisere inventaret ditt',
      icon: Check,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
            <Check className="w-16 h-16 text-green-600" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Gratulerer!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Du har nå opprettet din første lokasjon og gjenstand. 
              Systemet er klart til bruk!
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Neste steg:</h3>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Utforsk dashboard for å se oversikten</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Legg til flere gjenstander og lokasjoner</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Skriv ut QR-koder for enkel skanning</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Utforsk avanserte funksjoner</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await handleComplete()
      return
    }

    // Validate current step
    if (currentStep === 1 && !userData.primaryUse) {
      toast.error('Vennligst velg hovedformål')
      return
    }
    if (currentStep === 2 && !userData.firstLocationName.trim()) {
      toast.error('Vennligst skriv inn navn på lokasjon')
      return
    }
    if (currentStep === 3 && !userData.sampleItemName.trim()) {
      toast.error('Vennligst skriv inn navn på gjenstand')
      return
    }

    // Create location on step 3
    if (currentStep === 2) {
      try {
        await createLocationMutation.mutateAsync({
          name: userData.firstLocationName,
          type: userData.firstLocationType,
          description: `Opprettet under onboarding - ${userData.firstLocationName}`
        })
        toast.success('Lokasjon opprettet!')
      } catch (error) {
        toast.error('Kunne ikke opprette lokasjon')
        return
      }
    }

    setCurrentStep(prev => prev + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    try {
      // Initialize categories if user selected any inventory types
      if (userData.inventoryTypes.length > 0) {
        await initializeCategoriesMutation.mutateAsync()
      }

      // Create sample item if provided
      if (userData.sampleItemName.trim()) {
        const locations = await trpc.locations.getAll.useQuery().refetch()
        const firstLocation = locations.data?.[0]
        
        if (firstLocation) {
          await createItemMutation.mutateAsync({
            name: userData.sampleItemName,
            locationId: firstLocation.id,
            totalQuantity: 1,
            unit: userData.defaultUnit
          })
        }
      }

      toast.success('Onboarding fullført!')
      onComplete()
    } catch (error) {
      toast.error('Noe gikk galt under fullføring')
    }
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Steg {currentStep + 1} av {steps.length}
            </Badge>
            {onSkip && currentStep < steps.length - 1 && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Hopp over
              </Button>
            )}
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <currentStepData.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <CardTitle>{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="min-h-[400px]">
            {currentStepData.content}
          </div>
          
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={
                createLocationMutation.isPending ||
                createItemMutation.isPending ||
                initializeCategoriesMutation.isPending
              }
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Fullfør
                </>
              ) : (
                <>
                  Neste
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Progress component (since it might not exist)
function Progress({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-muted rounded-full h-2 ${className}`}>
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}
