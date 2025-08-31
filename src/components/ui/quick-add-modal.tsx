
'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { SmartCategorization } from '@/components/predictive/PredictiveMaintenance'
import {
  Plus,
  Camera,
  Barcode,
  Sparkles,
  MapPin,
  Package,
  Loader2,
  CheckCircle,
  Wand2,
  X,
  AlertCircle
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface QuickAddModalProps {
  trigger?: React.ReactNode
  onItemAdded?: (item: any) => void
  defaultLocationId?: string
  mode?: 'text' | 'camera' | 'barcode'
  onModeChange?: (mode: 'text' | 'camera' | 'barcode') => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function QuickAddModal({
  trigger,
  onItemAdded,
  defaultLocationId,
  mode: controlledMode = 'text',
  onModeChange,
  open: controlledOpen,
  onOpenChange
}: QuickAddModalProps) {
  const { data: session } = useSession()
  const [internalOpen, setInternalOpen] = useState(false)
  const [internalMode, setInternalMode] = useState<'text' | 'camera' | 'barcode'>('text')
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input')
  const [loading, setLoading] = useState(false)
  const [aiAssisted, setAiAssisted] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const mode = controlledMode !== undefined ? controlledMode : internalMode
  const setMode = onModeChange || setInternalMode

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('stk')
  const [categoryId, setCategoryId] = useState('none')
  const [locationId, setLocationId] = useState(defaultLocationId || 'none')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)

  // Data fetching
  const { data: categoriesData } = (trpc.categories.getAll.useQuery as any)()
  const { data: locationsData } = (trpc.locations.getAll.useQuery as any)()
  
  // Ensure data is always arrays
  const categories = categoriesData && Array.isArray(categoriesData) ? categoriesData : []
  const locations = locationsData && Array.isArray(locationsData) ? locationsData : []
  const { data: aiEnabled } = trpc.ai.isEnabled.useQuery()

  // Mutations
  const createItem = (trpc.items.create.useMutation as any)({
    onSuccess: (item: any) => {
      toast.success('Gjenstand lagt til!')
      setStep('success')
      onItemAdded?.(item)
      setTimeout(() => {
        if (controlledOpen === undefined) {
          setOpen(false)
        } else {
          onOpenChange?.(false)
        }
        resetForm()
      }, 1500)
    },
    onError: (error: any) => {
      toast.error('Kunne ikke legge til gjenstand: ' + error.message)
      setLoading(false)
    }
  })

  const aiEnhanceItem = trpc.ai.enhanceItem.useMutation({
    onSuccess: (suggestions) => {
      setAiSuggestions(suggestions)
      setShowAiSuggestions(true)
      setAiAssisted(true)
      toast.success('AI har foreslått forbedringer!')

      // Auto-apply category and location if high confidence
      if (suggestions.category && suggestions.category.confidence > 0.8) {
        setCategoryId(suggestions.category.categoryId)
      }
      if (suggestions.location && suggestions.location.confidence > 0.8) {
        setLocationId(suggestions.location.locationId)
      }
      if (suggestions.enhancedDescription && !description) {
        setDescription(suggestions.enhancedDescription)
      }
    },
    onError: (error: any) => {
      toast.error('AI-forbedring feilet: ' + error.message)
    }
  })

  const resetForm = () => {
    setStep('input')
    setName('')
    setDescription('')
    setQuantity(1)
    setUnit('stk')
    setCategoryId('none')
    setLocationId(defaultLocationId || 'none')
    setPrice('')
    setNotes('')
    setAiSuggestions(null)
    setShowAiSuggestions(false)
    setAiAssisted(false)
    setLoading(false)
  }

  // Smart defaults based on user history
  useEffect(() => {
    if (open && !defaultLocationId) {
      // Could implement logic to suggest most recently used location
      // For now, we'll keep it simple
    }
  }, [open, defaultLocationId])

  const handleAISuggestions = () => {
    if (!name.trim()) {
      toast.error('Skriv inn et navn først')
      return
    }

    aiEnhanceItem.mutate({
      name,
      description,
      context: 'item_creation'
    })
  }

  const applyAISuggestion = (suggestionType: string, value: any) => {
    switch (suggestionType) {
      case 'category':
        setCategoryId(value)
        break
      case 'description':
        setDescription(value)
        break
      case 'quantity':
        setQuantity(value)
        break
      case 'unit':
        setUnit(value)
        break
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Navn er påkrevd')
      return
    }

    setLoading(true)

    const itemData = {
      name: name.trim(),
      description: description.trim(),
      availableQuantity: quantity,
      unit: unit,
      categoryId: categoryId && categoryId !== 'none' ? categoryId : null,
      locationId: locationId && locationId !== 'none' ? locationId : null,
      estimatedValue: price ? parseFloat(price) : null,
      notes: notes.trim(),
      images: [] // Could be enhanced with camera capture
    }

    createItem.mutate(itemData)
  }

  const handleQuickAdd = () => {
    if (!name.trim()) {
      toast.error('Skriv inn et navn først')
      return
    }

    // Apply smart defaults
    const smartDefaults = {
      categoryId: categories.find((c: any) => c.name.toLowerCase().includes('diverse'))?.id || '',
      locationId: defaultLocationId || locations.find((l: any) => l.type === 'ROOM')?.id || '',
      unit: quantity === 1 ? 'stk' : 'stk'
    }

    if (!categoryId) setCategoryId(smartDefaults.categoryId)
    if (!locationId) setLocationId(smartDefaults.locationId)

    setStep('confirm')
  }

  const getSmartDefaults = () => {
    return {
      category: categories.find((c: any) => c.name.toLowerCase().includes('diverse')),
      location: locations.find((l: any) => l.type === 'ROOM'),
      suggestions: [
        '📦 Diverse',
        '🏠 Stue',
        '🍽️ Kjøkken',
        '🛏️ Soverom',
        '🛁 Bad'
      ]
    }
  }

  const smartDefaults = getSmartDefaults()

  if (step === 'success') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gjenstand lagt til!</h3>
            <p className="text-muted-foreground text-center">
              "{name}" er nå lagt til i inventaret ditt.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Hurtig tillegg</span>
            <span className="sm:hidden">Legg til</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Hurtig tillegg av gjenstand
          </DialogTitle>
          <DialogDescription>
            Legg til en gjenstand på under 30 sekunder med smarte forslag
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => setMode('camera')}
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs">Ta bilde</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => setMode('barcode')}
              >
                <Barcode className="w-5 h-5" />
                <span className="text-xs">Skann strekkode</span>
              </Button>
              <Button
                variant={mode === 'text' ? 'default' : 'outline'}
                size="sm"
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => setMode('text')}
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs">Skriv inn</span>
              </Button>
            </div>

            <Separator />

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn *</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    placeholder="f.eks. Kaffekrus, Strykejern, Bok..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                  />
                  {aiEnabled?.enabled && name && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAISuggestions}
                      disabled={aiEnhanceItem.isPending}
                    >
                      {aiEnhanceItem.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : aiAssisted ? (
                        <Sparkles className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  placeholder="Valgfritt: farge, størrelse, merke..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Antall</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Enhet</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stk">Stykk</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="l">Liter</SelectItem>
                      <SelectItem value="m">Meter</SelectItem>
                      <SelectItem value="pk">Pakke</SelectItem>
                      <SelectItem value="eske">Esk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category and Location Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen kategori</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lokasjon</Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg lokasjon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen lokasjon</SelectItem>
                      {locations.map((location: any) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* AI-Powered Smart Categorization */}
            {aiEnabled?.enabled && name.trim() && (
              <SmartCategorization
                itemName={name}
                itemDescription={description}
                onCategorySelect={(category) => {
                  setCategoryId(category.id)
                  toast.success(`Kategori endret til "${category.name}"`)
                }}
                className="mt-6"
              />
            )}

            {/* AI Suggestions */}
            {showAiSuggestions && aiSuggestions && aiSuggestions.suggestions && aiSuggestions.suggestions.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">AI Forslag</span>
                  </div>

                  <div className="space-y-2">
                    {aiSuggestions.suggestions.map((suggestion: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded">
                        <div className="flex-1">
                          <span className="text-sm font-medium">{suggestion.label}</span>
                          {suggestion.reasoning && (
                            <p className="text-xs text-muted-foreground mt-1">{suggestion.reasoning}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => applyAISuggestion(suggestion.type, suggestion.value)}
                        >
                          Bruk
                        </Button>
                      </div>
                    ))}

                    {aiSuggestions.duplicates && aiSuggestions.duplicates.length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">Mulige duplikater</span>
                        </div>
                        <p className="text-xs text-yellow-600">
                          {aiSuggestions.duplicates.length} lignende gjenstand(er) funnet
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Smart Defaults Preview */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Smarte standardverdier</span>
                </div>

                <div className="space-y-2 text-sm">
                  {!categoryId && smartDefaults.category && (
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3" />
                      <span>Kategori: {smartDefaults.category.name}</span>
                    </div>
                  )}

                  {!locationId && smartDefaults.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>Lokasjon: {smartDefaults.location.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (controlledOpen === undefined) {
                    setOpen(false)
                  } else {
                    onOpenChange?.(false)
                  }
                }}
                className="flex-1"
              >
                Avbryt
              </Button>
              <Button
                onClick={handleQuickAdd}
                disabled={!name.trim() || loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Legg til raskt
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Bekreft tillegg</h3>
              <p className="text-muted-foreground">
                Er denne informasjonen korrekt?
              </p>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Navn:</span>
                    <span>{name}</span>
                  </div>

                  {description && (
                    <div className="flex justify-between">
                      <span className="font-medium">Beskrivelse:</span>
                      <span>{description}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-medium">Antall:</span>
                    <span>{quantity} {unit}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Kategori:</span>
                    <span>
                      {categoryId !== 'none' ? categories.find((c: any) => c.id === categoryId)?.name || 'Ingen' : 'Ingen'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Lokasjon:</span>
                    <span>
                      {locationId !== 'none' ? locations.find((l: any) => l.id === locationId)?.name || 'Ingen' : 'Ingen'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                className="flex-1"
              >
                Rediger
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Bekreft
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
