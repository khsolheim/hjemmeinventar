'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface MobileYarnWizardProps {
  onComplete: () => void
}

export function MobileYarnWizard({ onComplete }: MobileYarnWizardProps) {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'new' | 'existing'>('new')
  const [selectedMaster, setSelectedMaster] = useState('')

  // Form data
  const [masterData, setMasterData] = useState({
    name: '',
    producer: '',
    composition: '',
    yardage: '',
    weight: '',
    needleSize: '',
    careInstructions: '',
    store: '',
    notes: ''
  })

  const [batchData, setBatchData] = useState({
    name: '',
    batchNumber: '',
    color: '',
    colorCode: '',
    quantity: 1,
    pricePerSkein: 0,
    condition: 'Ny',
    notes: ''
  })

  // Get default location
  const { data: locations } = trpc.locations.getAll.useQuery()
  const defaultLocation = locations?.find(loc => loc.isDefault) || locations?.[0]

  // Get existing masters for dropdown
  const { data: mastersData } = trpc.yarn.getAllMasters.useQuery({
    limit: 100,
    offset: 0
  })

  // Mutations
  const createMasterMutation = trpc.yarn.createMaster.useMutation()
  const createBatchMutation = trpc.yarn.createBatch.useMutation()

  const handleMasterSubmit = async () => {
    if (!defaultLocation) {
      toast.error('Ingen lokasjon funnet')
      return
    }

    try {
      const master = await createMasterMutation.mutateAsync({
        ...masterData,
        locationId: defaultLocation.id
      })
      setSelectedMaster(master.id)
      setStep(3)
    } catch (error: any) {
      toast.error(`Feil: ${error.message}`)
    }
  }

  const handleBatchSubmit = async () => {
    if (!selectedMaster || !defaultLocation) {
      toast.error('Mangler master eller lokasjon')
      return
    }

    try {
      await createBatchMutation.mutateAsync({
        masterId: selectedMaster,
        locationId: defaultLocation.id,
        ...batchData
      })
      
      toast.success('Garn registrert!')
      onComplete()
    } catch (error: any) {
      toast.error(`Feil: ${error.message}`)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Velg registreringsmåte</CardTitle>
                <CardDescription>
                  Lag ny garntype eller legg til batch til eksisterende
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    mode === 'new' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  role="radio"
                  tabIndex={0}
                  aria-checked={mode === 'new'}
                  onClick={() => setMode('new')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setMode('new')
                    }
                  }}
                  aria-label="Create new yarn master"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      mode === 'new' ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {mode === 'new' && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                    </div>
                    <div>
                      <div className="font-medium">Ny Garntype</div>
                      <div className="text-sm text-muted-foreground">
                        Registrer helt ny garntype med første batch
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    mode === 'existing' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  role="radio"
                  tabIndex={0}
                  aria-checked={mode === 'existing'}
                  onClick={() => setMode('existing')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setMode('existing')
                    }
                  }}
                  aria-label="Add batch to existing yarn master"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      mode === 'existing' ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {mode === 'existing' && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                    </div>
                    <div>
                      <div className="font-medium">Eksisterende Garntype</div>
                      <div className="text-sm text-muted-foreground">
                        Legg til ny batch til eksisterende garntype
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        if (mode === 'new') {
          return (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Garntype-info</CardTitle>
                  <CardDescription>
                    Felles informasjon for denne garntypen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Navn *</Label>
                    <Input
                      id="name"
                      value={masterData.name}
                      onChange={(e) => setMasterData({...masterData, name: e.target.value})}
                      placeholder="f.eks. Drops Lima Rosa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="producer">Produsent *</Label>
                    <Select 
                      value={masterData.producer} 
                      onValueChange={(value) => setMasterData({...masterData, producer: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg produsent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Garnstudio">Garnstudio</SelectItem>
                        <SelectItem value="Sandnes Garn">Sandnes Garn</SelectItem>
                        <SelectItem value="Dale Garn">Dale Garn</SelectItem>
                        <SelectItem value="Hobbii">Hobbii</SelectItem>
                        <SelectItem value="Caron">Caron</SelectItem>
                        <SelectItem value="Red Heart">Red Heart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="composition">Sammensetning *</Label>
                    <Input
                      id="composition"
                      value={masterData.composition}
                      onChange={(e) => setMasterData({...masterData, composition: e.target.value})}
                      placeholder="f.eks. 65% ull, 35% alpakka"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="weight">Vekt</Label>
                      <Input
                        id="weight"
                        value={masterData.weight}
                        onChange={(e) => setMasterData({...masterData, weight: e.target.value})}
                        placeholder="f.eks. 50g"
                      />
                    </div>

                    <div>
                      <Label htmlFor="yardage">Løpelengde</Label>
                      <Input
                        id="yardage"
                        value={masterData.yardage}
                        onChange={(e) => setMasterData({...masterData, yardage: e.target.value})}
                        placeholder="f.eks. 100m"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="needleSize">Anbefalte pinner</Label>
                    <Select 
                      value={masterData.needleSize} 
                      onValueChange={(value) => setMasterData({...masterData, needleSize: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg pinnestørrelse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2.5mm">2.5mm</SelectItem>
                        <SelectItem value="3.0mm">3.0mm</SelectItem>
                        <SelectItem value="3.5mm">3.5mm</SelectItem>
                        <SelectItem value="4.0mm">4.0mm</SelectItem>
                        <SelectItem value="4.5mm">4.5mm</SelectItem>
                        <SelectItem value="5.0mm">5.0mm</SelectItem>
                        <SelectItem value="5.5mm">5.5mm</SelectItem>
                        <SelectItem value="6.0mm">6.0mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="store">Butikk</Label>
                    <Input
                      id="store"
                      value={masterData.store}
                      onChange={(e) => setMasterData({...masterData, store: e.target.value})}
                      placeholder="Hvor kjøpes garnet vanligvis"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        } else {
          return (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Velg Garntype</CardTitle>
                  <CardDescription>
                    Legg til ny batch til eksisterende garntype
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="master">Garntype</Label>
                    <Select 
                      value={selectedMaster} 
                      onValueChange={setSelectedMaster}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg eksisterende garntype" />
                      </SelectTrigger>
                      <SelectContent>
                        {(mastersData?.masters || []).map((master) => (
                          <SelectItem key={master.id} value={master.id}>
                            {master.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }

      case 3:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch-detaljer</CardTitle>
                <CardDescription>
                  Unike detaljer for denne spesifikke batchen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="batchName">Batch navn</Label>
                  <Input
                    id="batchName"
                    value={batchData.name}
                    onChange={(e) => setBatchData({...batchData, name: e.target.value})}
                    placeholder="f.eks. Rosa Lima Batch 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="batchNumber">Batch nummer *</Label>
                    <Input
                      id="batchNumber"
                      value={batchData.batchNumber}
                      onChange={(e) => setBatchData({...batchData, batchNumber: e.target.value})}
                      placeholder="LOT2024001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity">Antall nøster *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={batchData.quantity}
                      onChange={(e) => setBatchData({...batchData, quantity: parseInt(e.target.value) || 1})}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="color">Farge *</Label>
                  <Input
                    id="color"
                    value={batchData.color}
                    onChange={(e) => setBatchData({...batchData, color: e.target.value})}
                    placeholder="f.eks. Rosa, Lys blå"
                  />
                </div>

                <div>
                  <Label htmlFor="colorCode">Fargekode</Label>
                  <Input
                    id="colorCode"
                    value={batchData.colorCode}
                    onChange={(e) => setBatchData({...batchData, colorCode: e.target.value})}
                    placeholder="#FF69B4 eller 4312"
                  />
                </div>

                <div>
                  <Label htmlFor="pricePerSkein">Pris per nøste (kr)</Label>
                  <Input
                    id="pricePerSkein"
                    type="number"
                    value={batchData.pricePerSkein}
                    onChange={(e) => setBatchData({...batchData, pricePerSkein: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="condition">Tilstand</Label>
                  <Select 
                    value={batchData.condition} 
                    onValueChange={(value) => setBatchData({...batchData, condition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ny">Ny</SelectItem>
                      <SelectItem value="Brukt - god">Brukt - god</SelectItem>
                      <SelectItem value="Brukt - ok">Brukt - ok</SelectItem>
                      <SelectItem value="Brukt - dårlig">Brukt - dårlig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="batchNotes">Notater</Label>
                  <Textarea
                    id="batchNotes"
                    value={batchData.notes}
                    onChange={(e) => setBatchData({...batchData, notes: e.target.value})}
                    placeholder="Spesielle notater for denne batchen"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  const canContinue = () => {
    switch (step) {
      case 1:
        return mode !== ''
      case 2:
        if (mode === 'new') {
          return masterData.name && masterData.producer && masterData.composition
        } else {
          return selectedMaster !== ''
        }
      case 3:
        return batchData.batchNumber && batchData.color && batchData.quantity > 0
      default:
        return false
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Registreringsmåte'
      case 2: return mode === 'new' ? 'Garntype-info' : 'Velg Garntype'
      case 3: return 'Batch-detaljer'
      default: return ''
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Progress */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Steg {step} av 3</span>
          <span className="text-muted-foreground">{getStepTitle()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderStep()}
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-3">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Tilbake
            </Button>
          )}
          
          <Button 
            onClick={() => {
              if (step === 3) {
                handleBatchSubmit()
              } else if (step === 2 && mode === 'new') {
                handleMasterSubmit()
              } else {
                setStep(step + 1)
              }
            }}
            disabled={!canContinue() || createMasterMutation.isPending || createBatchMutation.isPending}
            className="flex-1"
          >
            {step === 3 ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {createBatchMutation.isPending ? 'Registrerer...' : 'Fullfør'}
              </>
            ) : step === 2 && mode === 'new' ? (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {createMasterMutation.isPending ? 'Oppretter...' : 'Opprett Garntype'}
              </>
            ) : (
              <>
                Neste
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
