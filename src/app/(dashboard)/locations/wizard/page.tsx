'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Package, 
  Briefcase, 
  Palette,
  Sparkles,
  Check,
  Plus
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'

// Template definitions
const TEMPLATES = [
  {
    id: 'new-home',
    name: 'Nytt Hjem',
    description: 'Opprett standard rom-struktur for et hjem',
    icon: Home,
    color: 'bg-blue-500',
    locations: [
      { name: 'Stue', type: 'ROOM', children: [
        { name: 'TV-benk', type: 'CABINET', children: [
          { name: 'Skuff 1', type: 'DRAWER' },
          { name: 'Skuff 2', type: 'DRAWER' }
        ]},
        { name: 'Bokhylle', type: 'SHELF', children: [
          { name: 'Hylle 1', type: 'SHELF_COMPARTMENT' },
          { name: 'Hylle 2', type: 'SHELF_COMPARTMENT' }
        ]}
      ]},
      { name: 'Kjøkken', type: 'ROOM', children: [
        { name: 'Kjøkkenskap', type: 'CABINET', children: [
          { name: 'Øvre hylle', type: 'SHELF_COMPARTMENT' },
          { name: 'Nedre hylle', type: 'SHELF_COMPARTMENT' }
        ]}
      ]},
      { name: 'Soverom', type: 'ROOM', children: [
        { name: 'Garderobe', type: 'CABINET', children: [
          { name: 'Hylle 1', type: 'SHELF_COMPARTMENT' },
          { name: 'Hylle 2', type: 'SHELF_COMPARTMENT' }
        ]}
      ]}
    ]
  },
  {
    id: 'office-setup',
    name: 'Kontor Setup',
    description: 'Organisert arbeidsområde med skap og hyller',
    icon: Briefcase,
    color: 'bg-green-500',
    locations: [
      { name: 'Kontor', type: 'ROOM', children: [
        { name: 'Skrivebord', type: 'CABINET', children: [
          { name: 'Skuff 1', type: 'DRAWER' },
          { name: 'Skuff 2', type: 'DRAWER' },
          { name: 'Skuff 3', type: 'DRAWER' }
        ]},
        { name: 'Bokhylle', type: 'SHELF', children: [
          { name: 'Dokumenter', type: 'SHELF_COMPARTMENT' },
          { name: 'Bøker', type: 'SHELF_COMPARTMENT' },
          { name: 'Arkivbokser', type: 'SHELF_COMPARTMENT' }
        ]},
        { name: 'Arkivskap', type: 'CABINET', children: [
          { name: 'Arkivboks 1', type: 'BOX' },
          { name: 'Arkivboks 2', type: 'BOX' }
        ]}
      ]}
    ]
  },
  {
    id: 'hobby-room',
    name: 'Hobbyrom',
    description: 'Spesialiserte oppbevaringsløsninger for hobbyer',
    icon: Palette,
    color: 'bg-purple-500',
    locations: [
      { name: 'Hobbyrom', type: 'ROOM', children: [
        { name: 'Verktøyskap', type: 'CABINET', children: [
          { name: 'Verktøy', type: 'DRAWER' },
          { name: 'Skruer og spiker', type: 'DRAWER' }
        ]},
        { name: 'Materialhylle', type: 'SHELF', children: [
          { name: 'Tre og planker', type: 'SHELF_COMPARTMENT' },
          { name: 'Maling og lakk', type: 'SHELF_COMPARTMENT' }
        ]},
        { name: 'Oppbevaringsbokser', type: 'SHELF', children: [
          { name: 'Boks 1', type: 'BOX' },
          { name: 'Boks 2', type: 'BOX' },
          { name: 'Boks 3', type: 'BOX' }
        ]}
      ]}
    ]
  },
  {
    id: 'single-room',
    name: 'Enkelt Rom',
    description: 'Bare ett rom med grunnleggende innhold',
    icon: Package,
    color: 'bg-gray-500',
    locations: [
      { name: 'Rom', type: 'ROOM', children: [
        { name: 'Skap 1', type: 'CABINET' },
        { name: 'Hylle 1', type: 'SHELF' }
      ]}
    ]
  }
]

type Step = 'template' | 'customize' | 'complete'

interface LocationItem {
  name: string
  type: string
  children?: LocationItem[]
}

export default function NewLocationWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null)
  const [customizedLocations, setCustomizedLocations] = useState<LocationItem[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // tRPC mutation for bulk creation
  const bulkCreateMutation = trpc.locations.bulkCreate.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count} lokasjoner opprettet!`)
      setCurrentStep('complete')
      setIsCreating(false)
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
      setIsCreating(false)
    }
  })

  const getStepProgress = () => {
    switch (currentStep) {
      case 'template': return 33
      case 'customize': return 66
      case 'complete': return 100
      default: return 0
    }
  }

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template)
    setCustomizedLocations(template.locations)
    setCurrentStep('customize')
  }

  const handleCustomizeLocation = (index: number, updates: Partial<LocationItem>) => {
    const updated = [...customizedLocations]
    updated[index] = { ...updated[index], ...updates }
    setCustomizedLocations(updated)
  }

  const handleAddLocation = () => {
    setCustomizedLocations([...customizedLocations, { name: 'Nytt Rom', type: 'ROOM' }])
  }

  const handleRemoveLocation = (index: number) => {
    setCustomizedLocations(customizedLocations.filter((_, i) => i !== index))
  }

  const flattenLocations = (locations: LocationItem[], parentId?: string): any[] => {
    const result: any[] = []
    
    locations.forEach(location => {
      const locationData = {
        name: location.name,
        type: location.type,
        parentId: parentId || null
      }
      result.push(locationData)
      
      if (location.children && location.children.length > 0) {
        // For now, we'll create children without proper parent linking
        // This would need to be enhanced to handle the async nature of creation
        const childrenData = flattenLocations(location.children)
        result.push(...childrenData)
      }
    })
    
    return result
  }

  const handleCreateLocations = async () => {
    if (!selectedTemplate) return
    
    setIsCreating(true)
    const flatLocations = flattenLocations(customizedLocations)
    
    try {
      await bulkCreateMutation.mutateAsync({
        locations: flatLocations
      })
    } catch (error) {
      console.error('Error creating locations:', error)
    }
  }

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Velg en mal</h2>
        <p className="text-muted-foreground">
          Kom raskt i gang med en ferdig mal, eller start fra bunnen av
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((template) => {
          const Icon = template.icon
          return (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${template.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {template.locations.length} hovedlokasjoner
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderCustomizeStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tilpass lokasjoner</h2>
          <p className="text-muted-foreground">
            Rediger navn og legg til flere lokasjoner etter behov
          </p>
        </div>
        <Button onClick={handleAddLocation} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Legg til rom
        </Button>
      </div>

      <div className="space-y-4">
        {customizedLocations.map((location, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    value={location.name}
                    onChange={(e) => handleCustomizeLocation(index, { name: e.target.value })}
                    className="text-lg font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                  />
                  <Badge variant="secondary" className="ml-2">
                    {location.type === 'ROOM' ? 'Rom' : location.type}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveLocation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Fjern
                </Button>
              </div>
              {location.children && location.children.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-muted">
                  <div className="text-sm text-muted-foreground">
                    Inkluderer: {location.children.map(child => child.name).join(', ')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => setCurrentStep('template')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbake
        </Button>
        <Button 
          onClick={handleCreateLocations}
          disabled={isCreating || customizedLocations.length === 0}
          className="bg-primary hover:bg-primary/90"
        >
          {isCreating ? (
            <>Oppretter...</>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Opprett lokasjoner
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Ferdig! 🎉</h2>
        <p className="text-muted-foreground">
          Lokasjonene dine er opprettet og klare til bruk
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Link href="/locations">
          <Button className="bg-primary hover:bg-primary/90">
            Se lokasjoner
          </Button>
        </Link>
        <Button 
          variant="outline"
          onClick={() => {
            setCurrentStep('template')
            setSelectedTemplate(null)
            setCustomizedLocations([])
          }}
        >
          Opprett flere
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/locations">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tilbake
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">🧙‍♂️ Lokasjon Wizard</h1>
                <p className="text-sm text-muted-foreground">
                  Opprett lokasjoner raskt og enkelt
                </p>
              </div>
            </div>
            
            <Badge variant="secondary">
              Steg {currentStep === 'template' ? '1' : currentStep === 'customize' ? '2' : '3'} av 3
            </Badge>
          </div>
          
          <div className="mt-4">
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {currentStep === 'template' && renderTemplateStep()}
          {currentStep === 'customize' && renderCustomizeStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  )
}