'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Check, ChevronLeft, ChevronRight, FileText, Printer, Settings } from 'lucide-react'
import type { LabelTemplate, PrinterProfile } from '@prisma/client'

interface WizardStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

interface PrintWizardProps {
  onComplete?: (jobId: string) => void
  onCancel?: () => void
  preselectedTemplate?: string
  preselectedItems?: string[]
}

export function PrintWizard({ 
  onComplete, 
  onCancel, 
  preselectedTemplate, 
  preselectedItems = [] 
}: PrintWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(null)
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [printData, setPrintData] = useState<Record<string, any>>({})
  const [quantity, setQuantity] = useState(1)
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)
  const [validationResults, setValidationResults] = useState<any>(null)

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Velg mal',
      description: 'Velg hvilken etikett-mal du vil bruke',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 2,
      title: 'Tilpass innhold',
      description: 'Fyll ut informasjon for etiketten',
      icon: <Settings className="h-5 w-5" />
    },
    {
      id: 3,
      title: 'Velg skriver',
      description: 'Velg skriver og innstillinger',
      icon: <Printer className="h-5 w-5" />
    },
    {
      id: 4,
      title: 'Bekreft og skriv ut',
      description: 'Gjennomgå og start utskrift',
      icon: <Check className="h-5 w-5" />
    }
  ]

  // Data queries
  const { data: templates, isLoading: templatesLoading } = trpc.printing.listTemplates.useQuery({
    includeSystem: true,
    type: undefined,
    size: undefined
  })

  const { data: printers, isLoading: printersLoading } = trpc.printing.listPrinters.useQuery()

  const templateValidation = trpc.printing.validateTemplate.useQuery(
    { templateId: selectedTemplate?.id || '' },
    { enabled: !!selectedTemplate?.id }
  )

  const costEstimation = trpc.printing.estimatePrintTime.useQuery(
    { 
      templateId: selectedTemplate?.id || '',
      quantity,
      printerId: selectedPrinter
    },
    { enabled: !!selectedTemplate?.id && !!selectedPrinter && quantity > 0 }
  )

  const createJobMutation = trpc.printing.createJob.useMutation({
    onSuccess: (data) => {
      onComplete?.(data.id)
    }
  })

  // Effects
  useEffect(() => {
    if (preselectedTemplate && templates) {
      const template = templates.find(t => t.id === preselectedTemplate)
      if (template) {
        setSelectedTemplate(template)
        setCurrentStep(2)
      }
    }
  }, [preselectedTemplate, templates])

  useEffect(() => {
    if (costEstimation.data) {
      setEstimatedCost(costEstimation.data.estimatedCost || null)
    }
  }, [costEstimation.data])

  useEffect(() => {
    if (templateValidation.data) {
      setValidationResults(templateValidation.data)
    }
  }, [templateValidation.data])

  const progress = (currentStep / steps.length) * 100

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedTemplate
      case 2:
        return validationResults?.isValid !== false
      case 3:
        return !!selectedPrinter
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    if (!selectedTemplate || !selectedPrinter) return

    try {
      await createJobMutation.mutateAsync({
        templateId: selectedTemplate.id,
        printerId: selectedPrinter,
        data: printData,
        quantity,
        priority,
        itemIds: preselectedItems
      })
    } catch (error) {
      console.error('Feil ved opprettelse av print job:', error)
    }
  }

  const renderTemplateSelection = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Tilgjengelige maler</h3>
        <p className="text-sm text-muted-foreground">
          Velg en mal fra biblioteket eller bruk en av systemmålene
        </p>
      </div>

      {templatesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : ''
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  {template.isSystemTemplate && (
                    <Badge variant="secondary" className="text-xs">System</Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {template.type} • {template.size}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>v{template.version}</span>
                    <span>{template.usageCount || 0} ganger brukt</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderContentCustomization = () => {
    if (!selectedTemplate) return null

    const templateFields = selectedTemplate.fields as any[] || []

    return (
      <div className="space-y-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Tilpass innhold</h3>
          <p className="text-sm text-muted-foreground">
            Fyll ut feltene for malen "{selectedTemplate.name}"
          </p>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Innhold</TabsTrigger>
            <TabsTrigger value="preview">Forhåndsvisning</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {templateFields.length > 0 ? (
              templateFields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label || field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'text' && (
                    <Input
                      id={field.name}
                      placeholder={field.placeholder}
                      value={printData[field.name] || ''}
                      onChange={(e) => setPrintData(prev => ({
                        ...prev,
                        [field.name]: e.target.value
                      }))}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={printData[field.name] || ''}
                      onChange={(e) => setPrintData(prev => ({
                        ...prev,
                        [field.name]: e.target.value
                      }))}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <Select 
                      value={printData[field.name] || ''}
                      onValueChange={(value) => setPrintData(prev => ({
                        ...prev,
                        [field.name]: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dynamic-text">Tekst</Label>
                  <Input
                    id="dynamic-text"
                    placeholder="Skriv inn tekst for etiketten"
                    value={printData.text || ''}
                    onChange={(e) => setPrintData(prev => ({
                      ...prev,
                      text: e.target.value
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dynamic-code">Kode (QR/Strekkode)</Label>
                  <Input
                    id="dynamic-code"
                    placeholder="Skriv inn kode"
                    value={printData.code || ''}
                    onChange={(e) => setPrintData(prev => ({
                      ...prev,
                      code: e.target.value
                    }))}
                  />
                </div>
              </div>
            )}

            {validationResults && !validationResults.isValid && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Valideringsfeil</span>
                </div>
                <ul className="mt-2 text-sm text-red-600">
                  {validationResults.errors?.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview">
            <div className="border rounded-lg p-8 bg-white">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Forhåndsvisning kommer her</p>
                <p className="text-sm mt-2">
                  Viser hvordan etiketten vil se ut med dine innstillinger
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const renderPrinterSelection = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Velg skriver og innstillinger</h3>
        <p className="text-sm text-muted-foreground">
          Velg hvilken skriver du vil bruke og angi utskriftsinnstillinger
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Skriver</Label>
            <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Velg skriver" />
              </SelectTrigger>
              <SelectContent>
                {printers?.map((printer) => (
                  <SelectItem key={printer.id} value={printer.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{printer.name}</span>
                      <Badge 
                        variant={printer.isOnline ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {printer.isOnline ? "Tilkoblet" : "Frakoblet"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Antall kopier</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label>Prioritet</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Lav</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">Høy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Kostnadsestimat</CardTitle>
            </CardHeader>
            <CardContent>
              {costEstimation.isLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : estimatedCost !== null ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Estimert kostnad:</span>
                    <span className="font-medium">{estimatedCost.toFixed(2)} kr</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Per etikett:</span>
                    <span>{(estimatedCost / quantity).toFixed(2)} kr</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Velg skriver for kostnadsestimat
                </p>
              )}
            </CardContent>
          </Card>

          {selectedPrinter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Skriverinformasjon</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const printer = printers?.find(p => p.id === selectedPrinter)
                  return printer ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Modell:</span>
                        <span>{printer.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lokasjon:</span>
                        <span>{printer.location || 'Ikke angitt'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={printer.isOnline ? "default" : "secondary"}>
                          {printer.isOnline ? "Tilkoblet" : "Frakoblet"}
                        </Badge>
                      </div>
                    </div>
                  ) : null
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Bekreft utskrift</h3>
        <p className="text-sm text-muted-foreground">
          Gjennomgå detaljene før du starter utskriften
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Navn:</span>
              <span className="font-medium">{selectedTemplate?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{selectedTemplate?.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Størrelse:</span>
              <span>{selectedTemplate?.size}</span>
            </div>
            <div className="flex justify-between">
              <span>Versjon:</span>
              <span>v{selectedTemplate?.version}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Utskrift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Skriver:</span>
              <span className="font-medium">
                {printers?.find(p => p.id === selectedPrinter)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Antall:</span>
              <span>{quantity} kopier</span>
            </div>
            <div className="flex justify-between">
              <span>Prioritet:</span>
              <span>{priority === 'LOW' ? 'Lav' : priority === 'MEDIUM' ? 'Medium' : 'Høy'}</span>
            </div>
            {estimatedCost && (
              <div className="flex justify-between font-medium">
                <span>Kostnad:</span>
                <span>{estimatedCost.toFixed(2)} kr</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Innhold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(printData).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key}:</span>
                <span className="font-medium truncate ml-4">{String(value)}</span>
              </div>
            ))}
            {Object.keys(printData).length === 0 && (
              <p className="text-sm text-muted-foreground">Ingen tilpasset innhold</p>
            )}
          </div>
        </CardContent>
      </Card>

      {createJobMutation.error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Feil ved opprettelse av print job</span>
          </div>
          <p className="mt-1 text-sm text-red-600">
            {createJobMutation.error.message}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Print Wizard</h2>
        <p className="text-muted-foreground">
          Følg trinnene for å opprette og skrive ut etiketter
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${currentStep >= step.id 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
              `}>
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-24 h-0.5 mx-4 
                  ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Steg {currentStep} av {steps.length}</span>
          <span>{Math.round(progress)}% fullført</span>
        </div>
      </div>

      {/* Current step title */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold">{steps[currentStep - 1].title}</h3>
        <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {currentStep === 1 && renderTemplateSelection()}
        {currentStep === 2 && renderContentCustomization()}
        {currentStep === 3 && renderPrinterSelection()}
        {currentStep === 4 && renderConfirmation()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Avbryt
            </Button>
          )}
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Tilbake
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentStep < steps.length ? (
            <Button 
              onClick={handleNext} 
              disabled={!canProceed()}
            >
              Neste
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinish}
              disabled={!canProceed() || createJobMutation.isLoading}
            >
              {createJobMutation.isLoading ? 'Starter utskrift...' : 'Start utskrift'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}