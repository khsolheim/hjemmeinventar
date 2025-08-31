'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QrCode, Package, CheckCircle, ArrowRight } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

export function PrintWizardTabs() {
  const [currentTab, setCurrentTab] = useState('template')
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

  const selectedTemplateData = availableTemplates.find(t => t.id === selectedTemplate)

  const canProceedToTab = (tab: string) => {
    switch (tab) {
      case 'template': return true
      case 'items': return !!selectedTemplate
      case 'config': return !!selectedTemplate && selectedItems.length > 0
      case 'print': return !!selectedTemplate && selectedItems.length > 0
      default: return false
    }
  }

  const handleTabChange = (tab: string) => {
    if (canProceedToTab(tab)) {
      setCurrentTab(tab)
    }
  }

  const getNextTab = () => {
    switch (currentTab) {
      case 'template': return 'items'
      case 'items': return 'config'
      case 'config': return 'print'
      default: return null
    }
  }

  const handleNext = () => {
    const nextTab = getNextTab()
    if (nextTab && canProceedToTab(nextTab)) {
      setCurrentTab(nextTab)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header med tabs */}
      <div className="border-b px-6 py-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Utskriftsveiviser</h1>
          <Button 
            onClick={handleNext} 
            disabled={!getNextTab() || !canProceedToTab(getNextTab()!)}
          >
            {currentTab === 'print' ? 'Skriv ut' : 'Neste'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger 
              value="template" 
              className="flex items-center gap-2"
              disabled={!canProceedToTab('template')}
            >
              {selectedTemplate && <CheckCircle className="h-3 w-3" />}
              Mal
            </TabsTrigger>
            <TabsTrigger 
              value="items" 
              className="flex items-center gap-2"
              disabled={!canProceedToTab('items')}
            >
              {selectedItems.length > 0 && <CheckCircle className="h-3 w-3" />}
              Gjenstander
            </TabsTrigger>
            <TabsTrigger 
              value="config" 
              className="flex items-center gap-2"
              disabled={!canProceedToTab('config')}
            >
              Konfigurasjon
            </TabsTrigger>
            <TabsTrigger 
              value="print" 
              className="flex items-center gap-2"
              disabled={!canProceedToTab('print')}
            >
              Utskrift
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab content - tar all plass */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={currentTab} className="h-full">
          {/* Template Tab */}
          <TabsContent value="template" className="h-full m-0">
            <div className="h-full flex">
              {/* Left: Template List */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium mb-2">Tilgjengelige maler</h2>
                    <p className="text-muted-foreground text-sm">
                      Velg en etikettmal for utskrift. Du kan også opprette en ny mal hvis ingen passer.
                    </p>
                  </div>
                  
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
              </div>
              
              {/* Right: Preview */}
              <div className="w-1/2 p-6 border-l overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">Forhåndsvisning</h2>
                  {selectedTemplate && selectedTemplateData ? (
                    <div className="space-y-4">
                      {/* Preview Card */}
                      <Card className="border-2 border-dashed border-blue-200 w-64 mx-auto">
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
                      
                      {/* Template Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Maldetaljer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Navn:</span>
                            <span>{selectedTemplateData.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{selectedTemplateData.type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Størrelse:</span>
                            <span>{selectedTemplateData.size}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="border-2 border-dashed border-gray-200 h-64 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Velg en mal for å se forhåndsvisning</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="h-full m-0">
            <div className="h-full flex">
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium mb-2">Velg gjenstander</h2>
                    <p className="text-muted-foreground text-sm">
                      Velg hvilke gjenstander du vil lage etiketter for.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedItems(['item-0', 'item-1', 'item-2'])}
                    >
                      Velg alle
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedItems([])}
                    >
                      Fjern alle
                    </Button>
                  </div>
                  
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
                            <div className="flex-1">
                              <span className="font-medium">{item}</span>
                              <p className="text-xs text-muted-foreground">Lokasjon: Stue</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="w-1/2 p-6 border-l overflow-y-auto bg-gray-50">
                <h2 className="text-lg font-medium mb-4">Valgte gjenstander</h2>
                <div className="space-y-2">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((itemId, index) => (
                      <Card key={itemId}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Gjenstand {itemId.split('-')[1]}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedItems(prev => prev.filter(id => id !== itemId))}
                            >
                              ×
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Ingen gjenstander valgt</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="h-full m-0">
            <div className="h-full flex">
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium mb-2">Konfigurer etikettdata</h2>
                    <p className="text-muted-foreground text-sm">
                      Tilpass informasjonen som skal vises på etikettene.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          <div>
                            <div className="font-medium text-sm">Inkluder QR-kode</div>
                            <div className="text-xs text-muted-foreground">Vis QR-kode på etikett</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          <div>
                            <div className="font-medium text-sm">Vis lokasjon</div>
                            <div className="text-xs text-muted-foreground">Inkluder lokasjonsnavn</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="mr-2" />
                          <div>
                            <div className="font-medium text-sm">Vis pris</div>
                            <div className="text-xs text-muted-foreground">Inkluder prisinformasjon</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              
              <div className="w-1/2 p-6 border-l overflow-y-auto bg-gray-50">
                <h2 className="text-lg font-medium mb-4">Forhåndsvisning med innstillinger</h2>
                <Card className="border-2 border-dashed border-blue-200 w-64 mx-auto">
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
              </div>
            </div>
          </TabsContent>

          {/* Print Tab */}
          <TabsContent value="print" className="h-full m-0">
            <div className="h-full flex">
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium mb-2">Klar for utskrift</h2>
                    <p className="text-muted-foreground text-sm">
                      Gjennomgå innstillingene og start utskriften.
                    </p>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Sammendrag</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mal:</span>
                        <span>{selectedTemplateData?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gjenstander:</span>
                        <span>{selectedItems.length} valgt</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Totale etiketter:</span>
                        <span>{selectedItems.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Button className="w-full" size="lg">
                    Skriv ut {selectedItems.length} etiketter
                  </Button>
                </div>
              </div>
              
              <div className="w-1/2 p-6 border-l overflow-y-auto bg-gray-50">
                <h2 className="text-lg font-medium mb-4">Endelig forhåndsvisning</h2>
                <div className="grid grid-cols-2 gap-4">
                  {selectedItems.slice(0, 4).map((itemId, index) => (
                    <Card key={itemId} className="border-2 border-dashed border-blue-200">
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-gray-200 mx-auto rounded flex items-center justify-center">
                            <QrCode className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="font-bold text-xs">Gjenstand {itemId.split('-')[1]}</div>
                          <div className="text-xs text-gray-600">Stue</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {selectedItems.length > 4 && (
                    <div className="flex items-center justify-center text-muted-foreground text-sm">
                      +{selectedItems.length - 4} flere
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
