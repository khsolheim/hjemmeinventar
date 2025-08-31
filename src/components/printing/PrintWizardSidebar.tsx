'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { QrCode, Package, CheckCircle, ArrowRight, BarChart3, FileText } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

export function PrintWizardSidebar() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Fetch real templates from database
  const { data: templatesData, isLoading: templatesLoading } = trpc.labelTemplates.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutter
    cacheTime: 10 * 60 * 1000, // 10 minutter
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })
  
  // Ensure templates is always an array
  const safeTemplatesData = templatesData && Array.isArray(templatesData) ? templatesData : []
  
  const availableTemplates = safeTemplatesData.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description || 'Ingen beskrivelse',
    type: template.type,
    size: template.size,
    icon: template.type === 'QR' ? QrCode : template.type === 'BARCODE' ? BarChart3 : FileText,
    xml: template.xml,
    usageCount: template.usageCount,
    isSystemDefault: template.isSystemDefault
  }))

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

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Utskriftsveiviser</h1>
            <p className="text-sm text-muted-foreground">
              Steg {currentStep} av {steps.length}: {steps[currentStep - 1]?.title}
            </p>
          </div>
          <Button onClick={handleNext} disabled={!canProceed() || currentStep === 4}>
            {currentStep === 4 ? 'Skriv ut' : 'Neste'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        {/* Progress */}
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

      {/* Main content med sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Template liste */}
        <div className="w-80 border-r bg-muted/30 overflow-y-auto">
          <div className="p-4">
            <h2 className="font-medium mb-3">
              {currentStep === 1 && 'Tilgjengelige maler'}
              {currentStep === 2 && 'Velg gjenstander'}
              {currentStep === 3 && 'Konfigurasjoner'}
              {currentStep === 4 && 'Sammendrag'}
            </h2>
            
            {currentStep === 1 && (
              <div className="space-y-3">
                {templatesLoading ? (
                  // Loading skeleton
                  [...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 bg-muted rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-full"></div>
                            <div className="flex gap-1.5">
                              <div className="h-5 bg-muted rounded w-12"></div>
                              <div className="h-5 bg-muted rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : availableTemplates.length > 0 ? (
                  availableTemplates.map((template) => {
                    const IconComponent = template.icon
                    return (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer transition-all hover:shadow-sm ${
                          selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <IconComponent className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground mb-1.5">
                                {template.description}
                              </p>
                              <div className="flex gap-1.5">
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{template.type}</Badge>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">{template.size}</Badge>
                                {template.isSystemDefault && (
                                  <Badge variant="default" className="text-xs px-1.5 py-0.5">Standard</Badge>
                                )}
                              </div>
                            </div>
                            {selectedTemplate === template.id && (
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-medium mb-2">Ingen maler funnet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Du må opprette minst én etikettmal før du kan bruke utskriftsveiiviseren.
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <a href="/printing/templates/new">
                          Opprett mal
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-2">
                {['Gjenstand 1', 'Gjenstand 2', 'Gjenstand 3', 'Gjenstand 4', 'Gjenstand 5'].map((item, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-sm" onClick={() => {
                    const itemId = `item-${index}`
                    setSelectedItems(prev => 
                      prev.includes(itemId) 
                        ? prev.filter(id => id !== itemId)
                        : [...prev, itemId]
                    )
                  }}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedItems.includes(`item-${index}`) 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {selectedItems.includes(`item-${index}`) && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{item}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">Inkluder QR-kode</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">Vis lokasjon</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Vis pris</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-sm">
                      <div className="font-medium">Mal:</div>
                      <div className="text-muted-foreground">{selectedTemplateData?.name}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-sm">
                      <div className="font-medium">Gjenstander:</div>
                      <div className="text-muted-foreground">{selectedItems.length} valgt</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        
        {/* Main area - preview og konfigurasjon */}
        <div className="flex-1 p-6 overflow-y-auto bg-background">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Forhåndsvisning</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTemplate && selectedTemplateData ? (
                <div className="flex items-center justify-center h-48">
                  <Card className="border-2 border-dashed border-primary/20 w-36">
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-muted mx-auto rounded flex items-center justify-center">
                          <QrCode className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="font-bold text-xs text-foreground">{'{{item.name}}'}</div>
                        <div className="text-xs text-muted-foreground">{'{{location.name}}'}</div>
                        <div className="text-xs text-muted-foreground/80">{'{{category.name}}'}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <div className="text-center">
                    <QrCode className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm">Velg en mal for å se forhåndsvisning</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
