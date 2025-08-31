'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { QrCode, Package, X, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface PrintWizardFullscreenProps {
  onClose: () => void
}

export function PrintWizardFullscreen({ onClose }: PrintWizardFullscreenProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Mock data for templates
  const availableTemplates = [
    {
      id: 'standard',
      name: 'Standard HMS Etikett',
      description: 'QR-kode med gjenstandsnavn og lokasjon',
      type: 'QR',
      size: 'STANDARD',
      icon: QrCode
    },
    {
      id: 'compact',
      name: 'Kompakt Etikett',
      description: 'Mindre etikett for små gjenstander',
      type: 'QR',
      size: 'SMALL',
      icon: Package
    },
    {
      id: 'detailed',
      name: 'Detaljert Etikett',
      description: 'Inkluderer pris og kategori informasjon',
      type: 'QR',
      size: 'LARGE',
      icon: QrCode
    }
  ]

  const steps = [
    { id: 1, title: 'Velg mal', description: 'Velg etikettmal' },
    { id: 2, title: 'Velg gjenstander', description: 'Velg gjenstander å etikettere' },
    { id: 3, title: 'Konfigurer', description: 'Fyll ut etikettdata' },
    { id: 4, title: 'Skriv ut', description: 'Se og bekreft utskrift' }
  ]

  const selectedTemplateData = availableTemplates.find(t => t.id === selectedTemplate)

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedTemplate
      case 2: return selectedItems.length > 0
      case 3: return true
      case 4: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between bg-white">
        <div>
          <h1 className="text-xl font-semibold">Utskriftsveiviser</h1>
          <p className="text-sm text-muted-foreground">
            Steg {currentStep} av {steps.length}: {steps[currentStep - 1]?.title}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className="text-xs font-medium">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-1" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Templates/Content */}
        <div className="w-1/2 p-6 overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Tilgjengelige maler</h2>
              <div className="space-y-3">
                {availableTemplates.map((template) => {
                  const IconComponent = template.icon
                  return (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {template.description}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="secondary">{template.type}</Badge>
                              <Badge variant="outline">{template.size}</Badge>
                            </div>
                          </div>
                          {selectedTemplate === template.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Velg gjenstander</h2>
              <p className="text-muted-foreground">Velg hvilke gjenstander du vil lage etiketter for.</p>
              <div className="space-y-2">
                {['Gjenstand 1', 'Gjenstand 2', 'Gjenstand 3'].map((item, index) => (
                  <Card key={index} className="cursor-pointer" onClick={() => {
                    const itemId = `item-${index}`
                    setSelectedItems(prev => 
                      prev.includes(itemId) 
                        ? prev.filter(id => id !== itemId)
                        : [...prev, itemId]
                    )
                  }}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 ${
                          selectedItems.includes(`item-${index}`) 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {selectedItems.includes(`item-${index}`) && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span>{item}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Konfigurer etikettdata</h2>
              <p className="text-muted-foreground">Tilpass informasjonen som skal vises på etikettene.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Inkluder QR-kode</label>
                  <div className="mt-1">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Ja, inkluder QR-kode</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Vis lokasjon</label>
                  <div className="mt-1">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Ja, vis lokasjon på etikett</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Klar for utskrift</h2>
              <p className="text-muted-foreground">
                Du er klar til å skrive ut {selectedItems.length} etiketter med {selectedTemplateData?.name} malen.
              </p>
              <Button className="w-full" size="lg">
                Skriv ut etiketter
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 p-6 border-l overflow-y-auto bg-gray-50">
          <h2 className="text-lg font-medium mb-4">Forhåndsvisning</h2>
          {selectedTemplate && selectedTemplateData ? (
            <Card className="border-2 border-dashed border-blue-200">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gray-200 mx-auto rounded flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="font-bold text-sm">{'{{item.name}}'}</div>
                  <div className="text-xs text-gray-600">{'{{location.name}}'}</div>
                  <div className="text-xs text-gray-500">{'{{category.name}}'}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-6 text-center text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Velg en mal for å se forhåndsvisning</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t px-6 py-4 flex justify-between bg-white">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbake
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed() || currentStep === 4}
          >
            Neste
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
