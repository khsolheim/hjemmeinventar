'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronLeft, ChevronRight, Package2, Palette, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { YarnUrlImporter } from './YarnUrlImporter'
import type { YarnProductData } from '@/lib/scraping/yarn-url-scraper'

// Schema for Master creation
const masterSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  producer: z.string().optional(),
  composition: z.string().optional(),
  yardage: z.string().optional(),
  weight: z.string().optional(),
  gauge: z.string().optional(),
  needleSize: z.string().optional(),
  careInstructions: z.string().optional(),
  store: z.string().optional(),
  notes: z.string().optional(),
  locationId: z.string().optional(),
})

// Schema for Batch creation (uten "Tilstand")
const batchSchema = z.object({
  batchNumber: z.string().min(1, 'Batch nummer er påkrevd'),
  color: z.string().min(1, 'Farge er påkrevd'),
  colorCode: z.string().optional(),
  quantity: z.number().min(1, 'Antall må være minst 1'),
  pricePerSkein: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type MasterFormData = z.infer<typeof masterSchema>
type BatchFormData = z.infer<typeof batchSchema>

interface YarnWizardProps {
  onComplete: () => void
  existingMasterId?: string // If adding batch to existing master
}

type WizardStep = 'choose-type' | 'url-import' | 'master-details' | 'color-details' | 'batch-details' | 'summary'

// Optional preset for quick batch creation
type YarnWizardPreset = {
  masterId?: string
  batch?: Partial<BatchFormData>
  colorId?: string
}

export function YarnWizard({ onComplete, existingMasterId, preset }: YarnWizardProps & { preset?: YarnWizardPreset }) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<WizardStep>(existingMasterId ? 'color-details' : 'choose-type')
  const [creationType, setCreationType] = useState<'new-master' | 'existing-master' | 'url-import' | null>(null)
  const [selectedMasterId, setSelectedMasterId] = useState<string>(existingMasterId || '')
  const [createdMaster, setCreatedMaster] = useState<any>(null)
  const [importedData, setImportedData] = useState<YarnProductData | null>(null)
  const [importedImageUrl, setImportedImageUrl] = useState<string | undefined>(undefined)
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(undefined)

  // Fetch data
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = trpc.locations.getAll.useQuery()
  const { data: mastersData } = trpc.yarn.getAllMasters.useQuery({ limit: 100, offset: 0 })
  const { data: colorsData } = trpc.yarn.getColorsForMaster.useQuery(
    { masterId: selectedMasterId },
    { enabled: !!selectedMasterId }
  )

  // Auto-velg farge når det kun finnes én
  React.useEffect(() => {
    if (currentStep === 'color-details' && !selectedColorId && Array.isArray(colorsData) && colorsData.length === 1) {
      setSelectedColorId(colorsData[0].id)
    }
  }, [currentStep, colorsData, selectedColorId])
  
  // Test simple query to see if trpc works at all
  const { data: testData, error: testError } = trpc.locations.getStats.useQuery()
  
  // Alternative: Try to get locations using a different approach - get all items to see their locations
  const { data: itemsData } = trpc.items.getAll.useQuery({ limit: 1 })
  
  // Alternative flat location query
  const { data: flatLocationsData, isLoading: flatLocationsLoading, error: flatLocationsError } = trpc.locations.getAllFlat.useQuery()
  
  // Combined loading state
  const isLoadingLocations = locationsLoading || flatLocationsLoading

  // Debug logging (reduced)
  if (testData?.totalLocations === 0) {
    console.log('YarnWizard: No locations found in database, will auto-create default location')
  }

  // Flaten location hierarchy to a simple list
  const flattenLocations = (locations: any[]): any[] => {
    const result: any[] = []
    const addLocation = (loc: any, prefix = '') => {
      result.push({
        ...loc,
        displayName: prefix + loc.name
      })
      if (loc.children) {
        loc.children.forEach((child: any) => addLocation(child, prefix + loc.name + ' / '))
      }
    }
    locations?.forEach(loc => addLocation(loc))
    return result
  }

  const locations = locationsData 
    ? flattenLocations(locationsData) 
    : flatLocationsData 
      ? flatLocationsData.map(loc => ({ ...loc, displayName: loc.name }))
      : []
  
  if (locations.length > 0) {
    console.log(`YarnWizard: Found ${locations.length} locations from ${locationsData ? 'hierarchical' : 'flat'} source`)
  }
  
  // AUTOMATISK OPPRETTELSE AV DEFAULT LOKASJON
  const createLocationMutation = trpc.locations.create.useMutation({
    onSuccess: () => {
      console.log('Default location created successfully!')
      // Refresh location data
      refetch()
    }
  })
  
  const refetch = () => {
    // Force refetch of all location queries  
    utils.locations.getAll.invalidate()
    utils.locations.getAllFlat.invalidate()
    utils.locations.getStats.invalidate()
  }
  
  const utils = trpc.useUtils()
  
  // Invalidate helpers
  const invalidateAfterCreate = (masterId: string) => {
    utils.yarn.getAllMasters.invalidate()
    utils.yarn.getBatchesForMaster.invalidate({ masterId })
    utils.yarn.getColorsForMaster.invalidate({ masterId })
  }
  
  // Auto-create default location if none exists (DISABLED - fixing existing data instead)
  React.useEffect(() => {
    if (testData && testData.totalLocations === 0 && !createLocationMutation.isPending) {
      console.log('YarnWizard: No locations found - server should fix this automatically')
      // createLocationMutation.mutate({
      //   name: 'Hovedlager',
      //   description: 'Standard lokasjon for garn',
      //   type: 'ROOM'
      // })
    }
  }, [testData, createLocationMutation])

  // Mutations
  const createMasterMutation = trpc.yarn.createMaster.useMutation()
  const createBatchMutation = trpc.yarn.createBatch.useMutation()
  const createColorMutation = trpc.yarn.createColor.useMutation()

  // Forms
  const masterForm = useForm<MasterFormData>({
    resolver: zodResolver(masterSchema),
    defaultValues: {
      name: '',
      producer: '',
      composition: '',
      yardage: '',
      weight: '',
      gauge: '',
      needleSize: '',
      careInstructions: '',
      store: '',
      notes: '',
      locationId: '',
    }
  })

  const batchForm = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchNumber: '',
      color: '',
      colorCode: '',
      quantity: 1,
      pricePerSkein: undefined,
      notes: '',
    }
  })

  // Apply preset if provided (prefill for color and jump to batch creation for a specific master)
  React.useEffect(() => {
    if (preset?.masterId) {
      setSelectedMasterId(preset.masterId)
      setCreationType('existing-master')
      setCurrentStep('color-details')
    }
    if (preset?.batch) {
      batchForm.reset({
        batchNumber: preset.batch.batchNumber ?? '',
        color: preset.batch.color ?? '',
        colorCode: preset.batch.colorCode ?? '',
        quantity: preset.batch.quantity ?? 1,
        pricePerSkein: preset.batch.pricePerSkein,
        notes: preset.batch.notes ?? ''
      })
    }
  }, [preset])

  const handleMasterSubmit = async (data: MasterFormData) => {
    try {
      const master = await createMasterMutation.mutateAsync(data)
      setCreatedMaster(master)
      setSelectedMasterId(master.id)
      invalidateAfterCreate(master.id)
      setCurrentStep('batch-details')
      toast.success('Garn-type opprettet!')
    } catch (error) {
      // Enhanced error handling with specific messages
      let errorMessage = 'Feil ved opprettelse av garn-type'
      
      if (error instanceof Error) {
        if (error.message.includes('kategori ikke funnet')) {
          errorMessage = 'Systemfeil: Manglende kategorier. Prøv igjen - systemet vil auto-reparere.'
        } else if (error.message.includes('lokasjon')) {
          errorMessage = 'Ingen lokasjoner funnet. Opprett en lokasjon først eller prøv igjen for auto-opprettelse.'
        } else if (error.message.includes('Ugyldig garn data')) {
          errorMessage = `Ugyldig data: ${error.message}`
        } else if (error.message.includes('UNAUTHORIZED')) {
          errorMessage = 'Du må være logget inn. Refresh siden og logg inn igjen.'
        } else {
          errorMessage = `Feil: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
      console.error('YarnWizard Master Creation Error:', {
        error,
        data,
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleBatchSubmit = async (data: BatchFormData) => {
    try {
      const masterId = selectedMasterId || createdMaster?.id
      if (!masterId) {
        toast.error('Ingen master valgt')
        return
      }

      // Get location for batch (use same as master or first available)
      const locationId = createdMaster?.locationId || locations[0]?.id
      if (!locationId) {
        toast.error('Ingen lokasjon tilgjengelig')
        return
      }

      const colorDisplay = selectedColorId
        ? (colorsData || []).find((c: any) => c.id === selectedColorId)?.name || data.color
        : data.color
      const batchName = `${colorDisplay || 'Batch'} - ${data.batchNumber}`
      
      // Bruk valgt farge fra fargesteg (eller preset)
      let colorId: string | undefined = selectedColorId || preset?.colorId

      await createBatchMutation.mutateAsync({
        masterId,
        name: batchName,
        locationId,
        ...data,
        imageUrl: importedImageUrl,
        colorId,
      })

      invalidateAfterCreate(masterId)
      setCurrentStep('summary')
      toast.success('Batch opprettet!')
      
      // Auto-complete after a short delay to let user see the success message
      setTimeout(() => {
        handleComplete()
      }, 2000)
    } catch (error) {
      const code = (error as any)?.data?.code
      if (code === 'CONFLICT') {
        toast.error('Batch finnes allerede for valgt farge og partinummer')
      } else {
        toast.error('Feil ved opprettelse av batch')
      }
      console.error(error)
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  // Håndter URL import
  const handleUrlImport = (productData: YarnProductData & { downloadedImages?: any[] }) => {
    setImportedData(productData)
    const firstDownloaded = productData.downloadedImages?.[0]?.url
    setImportedImageUrl(firstDownloaded)
    
    // Pre-fill master form med importerte data
    const toStringWithUnit = (value: unknown, unit?: string) => {
      if (value === undefined || value === null) return ''
      if (typeof value === 'number') return `${value}${unit || ''}`
      const str = String(value)
      // Hvis AI allerede har lagt til enhet, behold den
      if (unit && /\d\s*(g|m|mm)$/i.test(str)) return str
      return unit ? `${str}${str.match(/\d\s*(g|m|mm)$/i) ? '' : unit}` : str
    }

    masterForm.reset({
      name: productData.name,
      producer: productData.producer || '',
      composition: productData.composition || '',
      yardage: toStringWithUnit(productData.yardage, 'm'),
      weight: toStringWithUnit(productData.weight, 'g'),
      needleSize: toStringWithUnit(productData.needleSize, 'mm'),
      careInstructions: productData.careInstructions || '',
      store: productData.source.siteName || '',
      notes: productData.description || '',
      locationId: locations[0]?.id || '',
    })
    
    setCurrentStep('master-details')
    
    const imageCount = productData.downloadedImages?.length || 0
    if (imageCount > 0) {
      toast.success(`Produktdata og ${imageCount} bilder importert! Sjekk og juster informasjonen.`)
    } else {
      toast.success('Produktdata importert! Sjekk og juster informasjonen.')
    }
  }

  const nextStep = () => {
    if (currentStep === 'choose-type' && creationType === 'new-master') {
      setCurrentStep('master-details')
    } else if (currentStep === 'choose-type' && creationType === 'existing-master') {
      setCurrentStep('color-details')
    } else if (currentStep === 'choose-type' && creationType === 'url-import') {
      setCurrentStep('url-import')
    } else if (currentStep === 'url-import') {
      // URL import navigerer automatisk via handleUrlImport
      return
    } else if (currentStep === 'master-details') {
      masterForm.handleSubmit(handleMasterSubmit)()
    } else if (currentStep === 'color-details') {
      setCurrentStep('batch-details')
    } else if (currentStep === 'batch-details') {
      batchForm.handleSubmit(handleBatchSubmit)()
    }
  }

  const prevStep = () => {
    if (currentStep === 'url-import') {
      setCurrentStep('choose-type')
    } else if (currentStep === 'master-details') {
      if (creationType === 'url-import') {
        setCurrentStep('url-import')
      } else {
        setCurrentStep('choose-type')
      }
    } else if (currentStep === 'batch-details') {
      setCurrentStep('color-details')
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'choose-type': return 'Velg type registrering'
      case 'url-import': return 'Importer fra URL'
      case 'master-details': return 'Garn-type detaljer'
      case 'color-details': return 'Farge'
      case 'batch-details': return 'Batch detaljer'
      case 'summary': return 'Fullført!'
      default: return ''
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'choose-type': return 'Velg hvordan du vil registrere garnet'
      case 'url-import': return 'Lim inn link til produktsiden for automatisk import'
      case 'master-details': return importedData ? 'Sjekk og juster den importerte informasjonen' : 'Fyll inn felles informasjon om garn-typen'
      case 'color-details': return 'Velg eksisterende farge eller opprett ny'
      case 'batch-details': return 'Fyll inn informasjon om denne spesifikke batchen'
      case 'summary': return 'Garnet ditt er registrert og klart til bruk!'
      default: return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4">
        {['choose-type', 'master-details', 'color-details', 'batch-details', 'summary'].map((step, index) => {
          const isActive = currentStep === step
          const isCompleted = ['choose-type', 'master-details', 'batch-details', 'summary'].indexOf(currentStep) > index
          const isVisible = existingMasterId ? step !== 'choose-type' && step !== 'master-details' : true
          
          if (!isVisible) return null
          
          return (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isCompleted ? 'bg-green-600 text-white' : 
                  isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < 4 && (
                <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Step 1: Choose type */}
          {currentStep === 'choose-type' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  creationType === 'url-import' ? 'ring-2 ring-purple-600 bg-purple-50' : 'hover:shadow-md'
                }`}
                onClick={() => setCreationType('url-import')}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-8 w-8 text-purple-600" />
                    <div>
                      <CardTitle className="text-lg">Importer fra URL</CardTitle>
                      <CardDescription>
                        Hent automatisk fra produktside
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Lim inn link fra Adlibris, Hobbii eller andre nettsider.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  creationType === 'new-master' ? 'ring-2 ring-blue-600 bg-blue-50' : 'hover:shadow-md'
                }`}
                onClick={() => setCreationType('new-master')}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Package2 className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">Ny Garn-type</CardTitle>
                      <CardDescription>
                        Opprett manuelt med første batch
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Registrer alt manuelt når du ikke har produktlink.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  creationType === 'existing-master' ? 'ring-2 ring-green-600 bg-green-50' : 'hover:shadow-md'
                }`}
                onClick={() => setCreationType('existing-master')}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Palette className="h-8 w-8 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">Ny Batch</CardTitle>
                      <CardDescription>
                        Legg til batch til eksisterende type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Perfekt når du kjøper samme garn i ny farge.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 1.5: URL Import */}
          {currentStep === 'url-import' && (
            <YarnUrlImporter 
              onImport={handleUrlImport}
              disabled={createMasterMutation.isPending || createBatchMutation.isPending}
            />
          )}

          {/* Step 2: Master details */}
          {currentStep === 'master-details' && (
            <Form {...masterForm}>
              <form onSubmit={masterForm.handleSubmit(handleMasterSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={masterForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Garn Navn *</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. Drops Baby Merino" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={masterForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokasjon</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Velg lokasjon" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingLocations || createLocationMutation.isPending ? (
                              <SelectItem value="loading" disabled>
                                {createLocationMutation.isPending ? 'Oppretter standard lokasjon...' : 'Laster lokasjoner...'}
                              </SelectItem>
                            ) : locations.length === 0 ? (
                              <SelectItem value="no-locations" disabled>
                                Ingen lokasjoner tilgjengelige - Oppretter standard lokasjon...
                              </SelectItem>
                            ) : (
                              locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.displayName}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={masterForm.control}
                    name="producer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produsent</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. Garnstudio" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={masterForm.control}
                    name="composition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sammensetning</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. 100% Merino Wool" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={masterForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vekt</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. 50g" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={masterForm.control}
                    name="yardage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Løpelengde</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. 175m" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={masterForm.control}
                    name="needleSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anbefalte pinner</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. 2.5-4.0mm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={masterForm.control}
                    name="gauge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strikkefasthet</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. 21 masker = 10cm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={masterForm.control}
                    name="careInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vaskeråd</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. Håndvask 30°C" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={masterForm.control}
                    name="store"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Butikk</FormLabel>
                        <FormControl>
                          <Input placeholder="f.eks. Hobbii" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={masterForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notater</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Generelle notater om denne garn-typen..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {/* Step 2.5: Color details */}
          {currentStep === 'color-details' && (
            <div className="space-y-3">
              {creationType === 'existing-master' && (
                <div>
                  <Label>Velg eksisterende garn-type</Label>
                  <Select onValueChange={setSelectedMasterId} value={selectedMasterId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Velg garn-type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(mastersData?.masters || []).map((master) => {
                        const data = master.categoryData ? JSON.parse(master.categoryData) : {}
                        return (
                          <SelectItem key={master.id} value={master.id}>
                            {master.name} ({data.producer})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Velg eksisterende farge</Label>
                <Select onValueChange={(v) => setSelectedColorId(v)} value={selectedColorId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={(colorsData && colorsData.length > 0) ? 'Velg farge' : 'Ingen farger – opprett ny'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(colorsData || []).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}{c.colorCode ? ` (${c.colorCode})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground">Eller opprett ny:</div>
              <div className="grid grid-cols-2 gap-3">
                <Form {...batchForm}>
                  <form className="contents">
                    <FormField
                      control={batchForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fargenavn</FormLabel>
                          <FormControl>
                            <Input placeholder="f.eks. Skoggrønn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={batchForm.control}
                      name="colorCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fargekode</FormLabel>
                          <FormControl>
                            <Input placeholder="#2F4F4F eller 8082" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>

              <div>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const masterId = selectedMasterId || createdMaster?.id
                    if (!masterId) { toast.error('Ingen master valgt'); return }
                    const name = batchForm.getValues('color')
                    if (!name) { toast.error('Fargenavn er påkrevd'); return }
                    try {
                      const color = await createColorMutation.mutateAsync({
                        masterId,
                        name,
                        colorCode: batchForm.getValues('colorCode') || undefined,
                      })
                      setSelectedColorId(color.id)
                      await trpc.useUtils().yarn.getColorsForMaster.invalidate()
                      toast.success('Farge opprettet!')
                    } catch (e) {
                      toast.error('Kunne ikke opprette farge')
                    }
                  }}
                >
                  Opprett farge
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Batch details */}
          {currentStep === 'batch-details' && (
            <div className="space-y-4">
              {creationType === 'existing-master' && (
                <div>
                  <Label>Velg eksisterende garn-type</Label>
                  <Select onValueChange={setSelectedMasterId} value={selectedMasterId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Velg garn-type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(mastersData?.masters || []).map((master) => {
                        const data = master.categoryData ? JSON.parse(master.categoryData) : {}
                        return (
                          <SelectItem key={master.id} value={master.id}>
                            {master.name} ({data.producer})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Form {...batchForm}>
                <form onSubmit={batchForm.handleSubmit(handleBatchSubmit)} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={batchForm.control}
                      name="batchNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Nummer *</FormLabel>
                          <FormControl>
                            <Input placeholder="f.eks. LOT2024001" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unikt nummer for denne batchen/fargen
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Only show color fields if no color is selected yet */}
                    {!selectedColorId && (
                      <>
                        <FormField
                          control={batchForm.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farge *</FormLabel>
                              <FormControl>
                                <Input placeholder="f.eks. Light Pink" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={batchForm.control}
                          name="colorCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farge Kode</FormLabel>
                              <FormControl>
                                <Input placeholder="f.eks. #FFB6C1 eller navn" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Show selected color info if a color is selected */}
                    {selectedColorId && (
                      <div className="col-span-2 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-green-800">
                            <strong>Valgt farge:</strong> {(() => {
                              const selectedColor = colorsData?.find(c => c.id === selectedColorId)
                              return selectedColor ? `${selectedColor.name}${selectedColor.colorCode ? ` (${selectedColor.colorCode})` : ''}` : 'Ukjent farge'
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    <FormField
                      control={batchForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antall Nøster *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-2">
                      <FormField
                        control={batchForm.control}
                        name="pricePerSkein"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pris per Nøste (kr)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                min="0"
                                placeholder="89.50"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Tilstand felt fjernet */}
                  </div>

                  <FormField
                    control={batchForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Notater</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Spesifikke notater for denne batchen..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 'summary' && (
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Garnet er registrert!</h3>
                <p className="text-muted-foreground">
                  Ditt garn er nå tilgjengelig i oversikten og kan brukes i prosjekter.
                </p>
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm">
                  {creationType === 'new-master' ? 'Ny garn-type opprettet' : 'Batch lagt til eksisterende type'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={
            currentStep === 'choose-type' || 
            currentStep === 'summary' || 
            (existingMasterId && currentStep === 'batch-details')
          }
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Tilbake
        </Button>

        <div className="space-x-2">
          {currentStep !== 'summary' && currentStep !== 'url-import' && (
            <Button 
              onClick={nextStep}
              disabled={
                (currentStep === 'choose-type' && !creationType) ||
                (currentStep === 'color-details' && !selectedColorId && !batchForm.getValues('color')) ||
                (currentStep === 'batch-details' && creationType === 'existing-master' && !selectedMasterId) ||
                createMasterMutation.isPending ||
                createBatchMutation.isPending
              }
            >
              {createMasterMutation.isPending || createBatchMutation.isPending ? (
                'Oppretter...'
              ) : currentStep === 'batch-details' ? (
                'Opprett'
              ) : (
                <>
                  Neste
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}

          {currentStep === 'summary' && (
            <div className="flex items-center gap-2">
              <Button onClick={() => { setCurrentStep('color-details'); setSelectedColorId(undefined); }} variant="secondary">
                Legg til én til
              </Button>
              <Button onClick={handleComplete} size="lg" className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Ferdig
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
