'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Sparkles,
  Check
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface TextQuickAddProps {
  onComplete: () => void
  onProcessingChange: (processing: boolean) => void
}

export function TextQuickAdd({ onComplete, onProcessingChange }: TextQuickAddProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: '',
    description: ''
  })
  const [suggestions, setSuggestions] = useState<any[]>([])

  const createItemMutation = trpc.items.create.useMutation()
  const getSuggestionsQuery = trpc.items.getSuggestions.useQuery(
    { query: formData.name },
    { enabled: formData.name.length > 2 }
  )

  const defaultLocations = [
    { id: 'living-room', name: 'Stue' },
    { id: 'kitchen', name: 'Kjøkken' },
    { id: 'bedroom', name: 'Soverom' },
    { id: 'bathroom', name: 'Bad' },
    { id: 'garage', name: 'Garasje' },
    { id: 'basement', name: 'Kjeller' }
  ]

  const defaultCategories = [
    { id: 'electronics', name: 'Elektronikk' },
    { id: 'clothing', name: 'Klesplagg' },
    { id: 'books', name: 'Bøker' },
    { id: 'tools', name: 'Verktøy' },
    { id: 'kitchen', name: 'Kjøkkenutstyr' },
    { id: 'furniture', name: 'Møbler' },
    { id: 'decorations', name: 'Dekorasjoner' },
    { id: 'sports', name: 'Sportsutstyr' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    onProcessingChange(true)

    try {
      await createItemMutation.mutateAsync({
        name: formData.name,
        locationId: formData.location,
        category: formData.category,
        description: formData.description
      })

      onComplete()
    } catch (error) {
      console.error('Failed to create item:', error)
    } finally {
      onProcessingChange(false)
    }
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }))
    
    // Auto-suggest location and category based on name
    if (value.length > 2) {
      const lowerValue = value.toLowerCase()
      
      // Simple keyword matching for location suggestions
      if (lowerValue.includes('kjøkken') || lowerValue.includes('mat') || lowerValue.includes('kaffe')) {
        setFormData(prev => ({ ...prev, location: 'kitchen' }))
      } else if (lowerValue.includes('sove') || lowerValue.includes('seng')) {
        setFormData(prev => ({ ...prev, location: 'bedroom' }))
      } else if (lowerValue.includes('bad') || lowerValue.includes('dusj')) {
        setFormData(prev => ({ ...prev, location: 'bathroom' }))
      } else if (lowerValue.includes('garasje') || lowerValue.includes('bil')) {
        setFormData(prev => ({ ...prev, location: 'garage' }))
      }

      // Simple keyword matching for category suggestions
      if (lowerValue.includes('bok') || lowerValue.includes('lese')) {
        setFormData(prev => ({ ...prev, category: 'books' }))
      } else if (lowerValue.includes('verktøy') || lowerValue.includes('hammer') || lowerValue.includes('skru')) {
        setFormData(prev => ({ ...prev, category: 'tools' }))
      } else if (lowerValue.includes('elektronikk') || lowerValue.includes('telefon') || lowerValue.includes('laptop')) {
        setFormData(prev => ({ ...prev, category: 'electronics' }))
      } else if (lowerValue.includes('klær') || lowerValue.includes('sko')) {
        setFormData(prev => ({ ...prev, category: 'clothing' }))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Item Name */}
      <div>
        <Label htmlFor="itemName">Gjenstandens navn *</Label>
        <Input
          id="itemName"
          placeholder="F.eks. 'Kaffemaskin' eller 'Strikkepinner'"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      {/* Smart Suggestions */}
      {getSuggestionsQuery.data && getSuggestionsQuery.data.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Foreslåtte gjenstander:</Label>
          <div className="flex flex-wrap gap-2">
            {getSuggestionsQuery.data.slice(0, 3).map((suggestion) => (
              <Badge
                key={suggestion.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    name: suggestion.name,
                    location: suggestion.locationId || prev.location,
                    category: suggestion.category || prev.category
                  }))
                }}
              >
                {suggestion.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      <div>
        <Label htmlFor="location">Lokasjon</Label>
        <Select
          value={formData.location}
          onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Velg lokasjon" />
          </SelectTrigger>
          <SelectContent>
            {defaultLocations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Kategori</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Velg kategori" />
          </SelectTrigger>
          <SelectContent>
            {defaultCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Beskrivelse (valgfritt)</Label>
        <Input
          id="description"
          placeholder="Legg til mer informasjon om gjenstanden"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!formData.name.trim() || createItemMutation.isLoading}
      >
        {createItemMutation.isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Legger til...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Legg til gjenstand
          </>
        )}
      </Button>

      {/* Smart Tips */}
      {formData.name && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">Smart tips:</span>
          </div>
          <ul className="space-y-1">
            <li>• Du kan legge til flere detaljer senere</li>
            <li>• Bruk kamera-funksjonen for automatisk gjenkjenning</li>
            <li>• QR-koder kan automatisk fylle ut informasjon</li>
          </ul>
        </div>
      )}
    </form>
  )
}
